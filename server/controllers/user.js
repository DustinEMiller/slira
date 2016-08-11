'use strict'

const User = require('../models/User'),
	req = require('request'),
	Boom = require('boom'),
	config = require('../config'),
	userUtils = require('../utils/user')

function existingJiraUser(options) {
	return new Promise((resolve, reject) => {
	    req(options, function(err, httpResponse, body) {
			return resolve(httpResponse);
	    });
  	});	
}

module.exports.addNew = function(request, reply) {
	let user = new User(),
		userCheck;

	user.email = request.payload.email;
	user.password = request.payload.password;

	userUtils.registrationRequest(request.payload.token)
		.then(function (request) {
            return {status: request.data.status, email: request.data.email, slackUserName: request.data.slackUserName};
        })
        .catch(function (data) {
            return {status: data.status};
        });
}

module.exports.updateAccount = function(request, reply) {
	let user = new User(),
		userCheck;

	user.jiraUserName = request.payload.jiraUserName;
	user.jiraPassword = request.payload.jiraPassword;
	user.slackUserName = request.payload.slackUserName;

	let options = {
		headers: {
			'X-Atlassian-Token': 'no-check',
			'Content-Type': 'application/json',
			'Authorization': 'Basic ' + new Buffer(user.jiraUserName + ":" + user.jiraPassword).toString('base64')
		},	
	};

	let opts = Object.create(options);
	opts.url = config.jira.url + '/rest/api/2/myself';

	//See if valid credentials for JIRA
	existingJiraUser(opts)
		.then((result) => {

			if(result.statusCode !== 200) {
				return reply(Boom.unauthorized('Invalid JIRA credentials'));
			}
			user.save((err) => {
				if (err) {
					return reply(Boom.badRequest('User already exists'));
				}
				return reply({success: true, msg: 'Successful created new user.', token: userUtils.createToken(user)}).header('content-type', 'application/json');
			});
		})
		.catch((err) => {
			return reply(err).header('content-type', 'application/json');
		});
}