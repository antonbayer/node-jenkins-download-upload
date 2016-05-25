"use strict";

var gulp = require('gulp');
var jenkinsProperties = require('./jenkins-properties');
var jenkins = require('jenkins')(jenkinsProperties.connection);
var fs = require('fs');

gulp.task('jenkinsDownload', function() {

	function getAllJobs() {

		jenkins.job.list(function(err, data) {
			
			if (err){
				return console.log(err);
			}
			
			if (data.length) {
				var callback = function(i) {
					i++;
					if (i < data.length) {
						getConfigXml(data[i].name, i, callback);
					}
				};
				getConfigXml(data[0].name, 0, callback);		
			}
		});
	}

	function getConfigXml(name, index, callback){
		
		jenkins.job.config(name, function(err, data) {
			if (err){
				return console.log(name + " " + err);
			}
			
			saveJobConfigToFile(name, data, index, callback);
		});
	}

	function saveJobConfigToFile(name, content, index, callback) {
		
		fs.writeFile("jobs-download/" + name + ".xml", content, function(err) {
			if(err) {
				return console.log(name + " " + err);
			}
			console.log(name + " saved");
			
			callback(index);
		});
	}

	getAllJobs();
});