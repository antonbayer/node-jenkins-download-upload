"use strict";

var gulp = require('gulp');
var jenkinsProperties = require('./jenkins-properties');
var jenkins = require('jenkins')(jenkinsProperties.connection);
var fs = require('fs');
var parseString = require('xml2js').parseString;

gulp.task('jenkinsMergeVerifierParsing', function() {
	
	var output = "";
	
	function getAllJobs() {

		fs.unlinkSync("jobs-parsing/list.txt");
	
		fs.readdir("jobs-parsing", function(err, files) {

			if (err){
				return console.log(err);
			}
			
			if (files.length) {
				var callback = function(i) {
					i++;
					if (i < files.length) {
						parseJob(files[i], i, callback);
					}
					else {
						fs.writeFile("jobs-parsing/list.txt", output, function(err) {
							if(err) {
								return console.log(err);
							}
						}); 
					}
				};
				parseJob(files[0], 0, callback);
			}
		});
	}

	function parseJob(file, index, callback) {
		
		fs.readFile("jobs-parsing/" + file, 'utf8', function(err, data) {
			if (err){
				return console.log(err);
			}
			parseString(data, {trim: true}, function (err, result) {

				var repo = result['maven2-moduleset'].scm[0].userRemoteConfigs[0]['hudson.plugins.git.UserRemoteConfig'][0].url[0]
					.replace(jenkinsProperties.sshGitPrefix, '').replace(jenkinsProperties.sshGitPostfix, '').split('/');

				var projectName = file.replace('-merge-request-verifier.xml','');

				var artId = result['maven2-moduleset'].rootModule[0].artifactId[0];
				var groupId = result['maven2-moduleset'].rootModule[0].groupId[0];
				
				output += "npm run #JOB#"
					+ " --git_group=" + repo[0]
					+ " --git_repo=" + repo[1]
					+ " --project-name=" + projectName
					+ " --artifact-group=" + groupId
					+ " --artifact-id=" + artId
					+ "\n";
					
				callback(index);
			});
		});
	}

	getAllJobs();
});