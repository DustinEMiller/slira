'use strict'

const User = require('../models/User'),
	req = require('request'),
	Boom = require('boom'),
	config = require('../config'),
	userUtils = require('../utils/user'),
	ConnectRequest = require('../models/ConnectRequest');

function existingJiraUser(options) {
	return new Promise((resolve, reject) => {
	    req(options, (err, httpResponse, body) => {
			return resolve(httpResponse);
	    });
  	});	
}

module.exports.addNew = (request, reply) => {
	let user = new User(),
		userCheck;

	user.email = request.payload.email;
	user.password = request.payload.password;

	User.findOne({ email: user.email}).exec()
		.then((response) => {
			if(response) {
				if(response.email === user.email) {
					return reply({success: false , msg: 'There is already an account associated with that email address.'});
				}	
			}
			
			ConnectRequest.findOne({connect_token: request.payload.token}).exec()
				.then((response) => {
					let msg = userUtils.tokenMessage(response);

					if(!msg.success) {
						return reply(msg);	
					}

					user.slackUserName = response.slackUserName;

					user.save((err) => {
						if (err) {
							return reply({success: false , msg: 'There was an issue creating your account. Please try again.'});
						}
						let tkn = userUtils.createToken(user);
						return reply({success: true, token: tkn});
					});

				})		
		})
		.catch((error) => {
			return reply({success: false, msg: "There was an error creating your account. Please try again"});
		});
}

module.exports.updateAccount = (request, reply) => {
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