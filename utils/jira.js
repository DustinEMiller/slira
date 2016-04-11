'use strict';
const Boom = require('boom');
const req = require('request');
const config = require('../config');
const headers = {
	headers: {
		'X-Atlassian-Token': 'no-check',
		'Content-Type': 'application/json',
		'Authorization': 'Basic ' + new Buffer(config.jira.username + ":" + config.jira.password).toString('base64')
	}	
};
var options;

function getRequest(options) {
	console.log(options);
	return new Promise((resolve, reject) => {
	    req(options, function(err, httpResponse, body) {

			if (err) {
				return reject(new Error(err));
			}

			if (httpResponse.statusCode === 200) {
				return resolve(JSON.parse(body));
			}

			if (httpResponse.statusCode === 404) {
				return reject(new Error('404 Response'));
			}

			return reject(new Error('Not OK Response'));
	    });
  	});		
}

function postRequest(options) {
	return new Promise((resolve, reject) => {
	    req.post(options, function(err, httpResponse, body) {
			if (err) {
				return reject(new Error(err));
			}

			if (httpResponse.statusCode === 200) {
				return resolve(JSON.parse(body));
			}

			if (httpResponse.statusCode === 204) {
				return resolve();	
			}

			return reject(new Error('Not OK Response'));
	    });
  	});		
}

function isNumber (o) {
  return ! isNaN (o-0) && o !== null && o !== "" && o !== false;
}

exports.retrieveTransitions = function(issue) {
	options = headers;
	options.url = config.jira.url + 'rest/api/2/issue/'+issue+'/transitions?expand=transitions.fields';
	return getRequest(options);
}

exports.issueDetails = function(issue){
	options = headers;
	options.url = config.jira.url + '/rest/api/2/issue/'+issue;
	return getRequest(options);
}

exports.transitionIssue = function(args) {
	var subCommand = args.split(/\s+/).slice(0,1);
	args = args.replace(subCommand[0], '').trim();

	return exports.retrieveTransitions(subCommand[0])
		.then((result) => {
			var statusId = args;

			if(!isNumber(args)) {
				var status = result.transitions.find((state) => {
					return state.name.toLowerCase() === args.toLowerCase();
				});	
				statusId = status.id;
			}
			
			options = headers;
			options.url = config.jira.url + 'rest/api/2/issue/'+subCommand[0]+'/transitions?expand=transitions.fields';
			options.json = {"transition": { "id": statusId }};
		
			return postRequest(options);
		})
		.then((result) => {
			console.log('result');
			return '1';
		})
		.catch((err) => {
			console.log(err);
			return 'error';
		});
}

exports.queryIssues = function(query) {
	options = headers;
	options.url = config.jira.url + 'rest/api/2/search?jql=assignee in ("'+query+'")';
	options.url = encodeURI(options.url);
	return getRequest(options);
}