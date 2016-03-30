'use strict';
const Boom = require('boom');
const req = require('request');
const config = require('../config');

var creds = config.jira.username + ":" config.jira.password;
var options = {
	url: '',
	headers: {
		'X-Atlassian-Token': 'no-check',
		'Content-Type': 'application/json',
		'Authorization': 'Basic ' + creds.toString('base64')
	}	
};

module.exports.transitionIssue = function(request, reply) {
	
}

module.exports.queryIssues = function() {
	console.log(options);
	options.url = config.jira.url + 'rest/api/2/search?jql=assignee=dustin.miller';

	req(options, function(error, response, body) {
		if (!error && response.statusCode == 200) {
    		var info = JSON.parse(body);
    		console.log('success');
  		} else {
  			console.log('error');
  		}
	});
}