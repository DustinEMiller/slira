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

module.exports.transitionIssue = function() {
	
}

module.exports.queryIssues = function() {
	options.url = config.jira.url + 'rest/api/2/search?jql=assignee=dustin.miller';
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