'use strict'

const User = require('../models/User'),
	req = require('request'),
	Boom = require('boom'),
	config = require('../config'),
	userUtils = require('../utils/user'),
	bcrypt = require('bcryptjs');

function existingJiraUser(options) {
	return new Promise((resolve, reject) => {
	    req(options, (err, httpResponse, body) => {
			return resolve(httpResponse);
	    });
  	});	
}

console.log(request.auth.credentials.profile);
reply.redirect(config.url+'/account');

module.exports.handleLogin = (request, reply) => {
	let user = new User(),
		userCheck;

	if(request.auth.credentials.profile)

	user.email = request.payload.email;
	user.password = request.payload.password;

	User.findOne({ email: user.email}).exec()
		.then((response) => {
			if(response) {
				if(response.email === user.email) {
					return reply({success: false , msg: 'There is already an account associated with that email address.'});
				}	
			}
			
			/*SlackState.findOne({connect_token: request.payload.token}).exec()
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

				})*/		
		})
		.catch((error) => {
			return reply({success: false, msg: "There was an error creating your account. Please try again"});
		});
}

module.exports.getAccount = (request, reply) => {
	if(request.auth.isAuthenticated && request.auth.credentials){

		User.findById(request.auth.credentials._id).exec()
	  		.then((response) => {
	  			if(response) {
	  				let user = {
	  					_id: response._id,
	  					email: response.email,
	  					slackUserName: response.slackUserName,
	  					jiraUserName: response.jiraUserName
	  				};
	  				return reply({success: true, user: user});
	  			} else {
	  				return reply({success: false, msg: "Unable to retrive profile information"});	
	  			}
	    		
	  		})
	  		.catch((error) => {
	  			return reply({success: false, msg: "Unable to retrive profile information"});		
	  		})
	} else {
		return reply({success: false, msg: "UnauthorizedError: private profile"});	
	}
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

module.exports.login = (request, reply) => {
	User.findOne({email: request.payload.email}).exec()
		.then((response) => {

			if(response) {
				bcrypt.compare(request.payload.password, response.password, (err, isValid) => {
					if (isValid) {
						return reply({success: true, token: userUtils.createToken(response) });
					}
					else {
						return reply({success: false, msg: "The email or password was incorrect."});
					}
				});
			} else {
				return reply({success: false, msg: "The email or password was incorrect."});
			}
		})
		.catch((error) => {
			console.log(error);
			return reply({success: false, msg: "There was an error logging you in. Please try again."});	
		});
}

module.exports.authenticate = (request, reply) => {
	console.log('authentications')
	console.log(request);
	//return reply.redirect('/login');
}