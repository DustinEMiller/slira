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

module.exports.queryIssues = function(callback) {
	options.url = config.jira.url + 'rest/api/2/search?jql=assignee=dustin.miller';

	req(options, function(error, response, body) {
		if (error || response.statusCode !== 200) {	
      		return error || {statusCode: response.statusCode};
    	} else {
    		var info = JSON.parse(body),
    			message = {
    				'attachments': {}
    			};

			message.attachments = info.issues.map(function(issue){
				return {
					'fallback': 'Task ' + issue.key + ' ' +issue.fields.summary + ' ' + issue.fields.description,
					'pretext': 'Task ' + issue.key,
					'title': issue.fields.summary,
					'text': issue.fields.description,
					'color': '#F35A00'
				}
			});

			return message;
    	}
	});
}