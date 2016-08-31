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

module.exports.handleLogin = (request, reply) => {
	let user = new User(),
		userCheck,
		credentials = request.auth.credentials,
		token,
		rq = request;

	if(request.auth.strategy === 'slack' && request.auth.isAuthenticated) {
		User.findOne({ accessToken: credentials.token}).exec()
		.then((response) => {

			if(response) {
				// account exists, check for match
				if(response.userId === credentials.profile.user_id && response.teamId === credentials.profile.raw.team_id) {
					console.log('1');
        			request.cookieAuth.set({
          				id: response.userId,
          				newAccount: false
        			});

        			return reply.redirect('/account');	
				}
				else {
					console.log('error2');
					return reply.redirect('/account');	
				}
			// create a new account
			} else {
				user.accessToken = credentials.token;
				user.userId = credentials.profile.user_id;
				user.teamId = credentials.profile.raw.team_id;

				user.save((error) => {
					if(error) {
						console.log('error3');
						return reply.redirect('/account');
					}
					token = userUtils.createToken(user);
					console.log('3');

					request.cookieAuth.set({
          				id: response.userId,
          				newAccount: true
        			});

        			return reply('/account');
				});
			}		
		})
		.catch((error) => {
			console.log(error);
			return reply.redirect(config.url+'/login', {success: false, msg: "There was an error creating or accessing your account. Please try again"});
		});
	}
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