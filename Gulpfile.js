"use strict";
var gulp = require('gulp');
var jenkins = require('jenkins')('http://user:pwd@url.to.jenkins.com');
var fs = require('fs');

gulp.task('jenkinsUpload', function() {

	var projectName = process.env.npm_config_project_name;
	if (projectName === undefined) {
		projectName = "";
	}
	var artifactGroup = process.env.npm_config_artifact_group;
	if (artifactGroup === undefined) {
		artifactGroup = "";
	}
	var artifactId = process.env.npm_config_artifact_id;
	if (artifactId === undefined) {
		artifactId = "";
	}
	var gitRepo = process.env.npm_config_git_repo;
	if (gitRepo === undefined) {
		gitRepo = "";
	}
	var gitRepo = process.env.npm_config_git_repo;
	if (gitRepo === undefined) {
		gitRepo = "";
	}
	var gitGroup = process.env.npm_config_git_group;
	if (gitGroup === undefined) {
		gitGroup = "";
	}
	
	function getAllJobs() {

		fs.readdir("jobs-upload", function(err, files) {

		for (var i = 0;i<files.length;i++) {	
				getFile(files[i]);		
			}  
		});
	}

	function getFile(file){
		
		fs.readFile("jobs-upload/" + file, 'utf8', function(err, data) {
			if (err){
				return console.log(err);
			}
			checkJob(replacePlaceholder(file.replace(".xml", "")), replacePlaceholder(data));
		});
	}

	function checkJob(name, content) {

		jenkins.job.exists(name, function(err, exists) {
			if (err) throw err;

			if(exists) {
				updateJob(name, content);
			}
			else {
				createJob(name, content);
			}
		});
	}

	function createJob(name, content) {

		jenkins.job.create(name, content, function(err) {
			if (err) throw err;
			console.log(name + " created.");
		});
	}

	function updateJob(name, content) {

		jenkins.job.config(name, content, function(err) {
			if (err) throw err;
			console.log(name + " updated.");
		});
	}
	
	function replacePlaceholder(str) {
		return str.replace(new RegExp('#GIT_GROUP#', 'g'), gitGroup)
			.replace(new RegExp('#GIT_REPO#', 'g'), gitRepo)
			.replace(new RegExp('#PROJECT_NAME#', 'g'), projectName)
			.replace(new RegExp('#ARTIFACT_GROUP#', 'g'), artifactGroup)
			.replace(new RegExp('#ARTIFACT_ID#', 'g'), artifactId);
	}

	getAllJobs();
});

gulp.task('jenkinsDownload', function() {

	function getAllJobs() {

		jenkins.job.list(function(err, data) {
			if (err){
				return console.log(err);
			}
			for (var i = 0;i<data.length;i++) {
				getConfigXml(data[i].name);		
			}  
		});
	}

	function getConfigXml(name){
		
		jenkins.job.config(name, function(err, data) {
			if (err){
				return console.log(name + " " + err);
			}
			
			saveJobConfigToFile(name, data);
		});
	}

	function saveJobConfigToFile(name, content) {
		
		fs.writeFile("jobs-download/" + name + ".xml", content, function(err) {
			if(err) {
				return console.log(name + " " + err);
			}
			console.log(name + " saved");
		});
	}

	getAllJobs();
});
