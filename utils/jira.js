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

			if (httpResponse.statusCode === 200) {
				return resolve(JSON.parse(body));
			}
			reject(new Error('Not OK Response'));
	    });
  	});		
}

module.exports.retrieveTransitions = function(args){
	options.url = config.jira.url + 'rest/api/2/issue/'+args[1]+'/transitions?expand=transitions.fields';
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

module.exports.queryIssues = function(args) {
	options.url = config.jira.url + 'rest/api/2/search?jql=assignee%20in%20("'+args[1]+'")';
	console.log(options);
	return getRequest();
}