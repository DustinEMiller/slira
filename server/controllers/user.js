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

			if(response && typeof credentials.token !== 'undefined') {
    			request.cookieAuth.set({
      				id: response.userId,
    			});

        		return reply.redirect('/account');	
			// create a new account
			} else {
				if(credentials.token) {
					// create a new account
					user.accessToken = credentials.token;
					user.userId = credentials.profile.user_id;
					user.teamId = credentials.profile.raw.team_id;
					user.slackUserName = credentials.profile.user;
					user.slackTeamName = credentials.profile.raw.team;

					user.save((error) => {
						if(error) {
							return reply.redirect('/loginError');
						}

						token = userUtils.createToken(user);

						request.cookieAuth.set({
	          				id: credentials.profile.user_id,
	        			});

	        			return reply.redirect('/account');
					});	
				} else {
					return reply.redirect('/unauthorized');
				}
			}		
		})
		.catch((error) => {
			return reply.redirect('/loginError');
		});
	}
}

module.exports.getAccount = (request, reply) => {
	if(request.auth.isAuthenticated && request.auth.credentials){

		User.findOne({userId: request.auth.credentials.id}).exec()
	  		.then((response) => {
	  			if(response) {

	  				let user = {
  						team: response.slackTeamName,
  						username: response.slackUserName,
  						jiraname: response.jiraUserName
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
	let user = new User();

	if(request.payload.username) {
		user.jiraUserName = request.payload.jiraUserName;
	} else if (request.payload.password) {
		user.jiraPassword = request.payload.jiraPassword;
	}

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
			return reply({success: false, msg: "There was an error logging you in. Please try again."});	
		});
}

module.exports.authenticate = (request, reply) => {
	console.log('authentications')
	console.log(request);
	//return reply.redirect('/login');
}