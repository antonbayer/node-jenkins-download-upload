"use strict";

var gulp = require('gulp');
var gitlabProperties = require('./gitlab-properties');

var gitlab = require('gitlab')({
  url:   gitlabProperties.url,
  token: gitlabProperties.token
});

gulp.task('gitlabWebhook', function() {

	var projectName = process.env.npm_config_project_name;
	if (projectName === undefined) {
		projectName = "";
	}
	var gitRepo = process.env.npm_config_git_repo;
	if (gitRepo === undefined) {
		gitRepo = "";
	}
	var gitGroup = process.env.npm_config_git_group;
	if (gitGroup === undefined) {
		gitGroup = "";
	}
	
	function getAllProjects() {
		gitlab.projects.all(function(projects) {
			for (var i = 0; i < projects.length; i++) {
				var project = projects[i];
				if (project.name == gitRepo && project.namespace.name == gitGroup) {
					getHooks(project.id);
					break;
				}
			}
		});
	}
	
	function getHooks(projectId) {
		gitlab.projects.hooks.list(projectId, function(hooks) {
			
			if (hooks.length) {
				var callback = function(i) {
					i++;
					if (i < hooks.length) {
						deleteHook(projectId, hooks[i].id, i, callback);
					}
					else {
						createNewHooks(projectId);}
				};
				deleteHook(projectId, hooks[0].id, 0, callback);		
			}
			else {
				createNewHooks(projectId);
			}
		});
	}
	
	function deleteHook(projectId, hookId, index, callback) {
		gitlab.projects.hooks.remove(projectId, hookId, function(ret) {
			callback(index);
		});
	}
	
	function createNewHooks(projectId) {
		gitlab.projects.hooks.add(projectId, {
				url: replacePlaceholder(gitlabProperties.pushEventUrl),
				push_events: true
			},
			function() {
				gitlab.projects.hooks.add(projectId, {
					url: replacePlaceholder(gitlabProperties.mergeEventUrl),
					push_events: false,
					merge_requests_events: true
				},
				function() {
				
				});
		});
	}
	
		function replacePlaceholder(str) {
		return str.replace(new RegExp('#GIT_GROUP#', 'g'), gitGroup)
			.replace(new RegExp('#GIT_REPO#', 'g'), gitRepo)
			.replace(new RegExp('#PROJECT_NAME#', 'g'), projectName);
	}
	
	getAllProjects();
});