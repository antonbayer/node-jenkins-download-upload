"use strict";
var gulp = require('gulp');
var jenkins = require('jenkins')('http://user:pwd@url.to.jenkins.com');
var fs = require('fs');

gulp.task('jenkinsUpload', function() {

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
			checkJob(file.replace(".xml", ""), data);
		});
	}

	function checkJob(name, content) {

		jenkins.job.config(name, function(err, data) {
			if (err) {
				if(err.notFound) {
					createJob(name, content);
					return;
				}
				throw err;
			}
			updateJob(name, content);
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