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
	console.log(options);
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

module.exports.retrieveTransitions = function(issue) {
	var opts = headers;
	opts.url = config.jira.url + 'rest/api/2/issue/'+issue+'/transitions?expand=transitions.fields';
	return getRequest(opts);
}

module.exports.issueDetails = function(issue){
	var opts = headers;
	opts.url = config.jira.url + '/rest/api/2/issue/'+issue;
	console.log(test);
	return getRequest(opts);
}

module.exports.transitionIssue = function(args) {
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
			var test = headers;
			test.test = 'lol';
			console.log(test);
			var opts = headers;
			opts.url = config.jira.url + 'rest/api/2/issue/'+subCommand[0]+'/transitions?expand=transitions.fields';
			opts.json = {"transition": { "id": statusId }};
		
			return postRequest(opts);
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

module.exports.queryIssues = function(query) {
	var opts = headers;
	opts.url = config.jira.url + 'rest/api/2/search?jql=assignee in ("'+query+'")';
	opts.url = encodeURI(opts.url);
	return getRequest(opts);
}