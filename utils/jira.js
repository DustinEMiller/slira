'use strict';
const Boom = require('boom');
const req = require('request');
const config = require('../config');

var options = {
	url: '',
	headers: {
		'X-Atlassian-Token': 'no-check',
		'Content-Type': 'application/json',
		'Authorization': 'Basic ' + new Buffer(config.jira.username + ":" + config.jira.password).toString('base64')
	}	
};

function getRequest() {
	return new Promise((resolve, reject) => {
	    req(options, function(err, httpResponse, body) {
			if (err) {
				return reject(new Error(err));
			}

			console.log(httpResponse.statusCode);
			console.log(JSON.parse(body));

			if (httpResponse.statusCode === 200) {
				return resolve(JSON.parse(body));
			}
			reject(new Error('Not OK Response'));
	    });
  	});		
}

function postRequest() {
	return new Promise((resolve, reject) => {
	    req.post(options, function(err, httpResponse, body) {
			if (err) {
				return reject(new Error(err));
			}

			console.log(httpResponse.statusCode);
			console.log(JSON.parse(body));

			if (httpResponse.statusCode === 200) {
				return resolve(JSON.parse(body));
			}
			reject(new Error('Not OK Response'));
	    });
  	});		
}

module.exports.retrieveTransitions = function(issue){
	options.url = config.jira.url + 'rest/api/2/issue/'+issue+'/transitions?expand=transitions.fields';
	return getRequest();
}

module.exports.issueDetails = function(issue){
	options.url = config.jira.url + '/rest/api/2/issue/'+issue;
	return getRequest();
}

module.exports.transitionIssue = function(args) {
	options.url = config.jira.url + 'rest/api/2/issue/'+args[1]+'/transitions?expand=transitions.fields';
	options.form = {"transition":{"id":"'++'"}};
	return new Promise((resolve, reject) => {
	    req.post(options, function(err, httpResponse, body) {
			if (err) {
				return reject(new Error(err));
			}

			if (httpResponse.statusCode === 200) {
				return resolve(JSON.parse(body));
			}
			reject(new Error('Not OK Response'));
	    });
  	});	
}

module.exports.queryIssues = function(query) {
	options.url = config.jira.url + 'rest/api/2/search?jql=assignee in ("'+query+'")';
	options.url = encodeURI(options.url);
	return getRequest();
}