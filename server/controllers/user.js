'use strict'

const User = require('../models/User');
const config = require('../config');
const bcrypt = require('bcryptjs');
const Boom = require('boom');
const consumer = require('../utils/oauth');

module.exports.handleLogin = (request, reply) => {
	let user = new User();
	let credentials = request.auth.credentials;
	let token;

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
							return reply(Boom.unauthorized('Error saving user'));
						}

						request.cookieAuth.set({
	          				id: credentials.profile.user_id,
	        			});

	        			return reply.redirect('/account');
					});	
				} else {
					return reply(Boom.unauthorized('No token provided'));
				}
			}		
		})
		.catch((error) => {
            return reply(Boom.unauthorized('Error finding user'));
		});
	} else {
        return reply(Boom.unauthorized());
    }
};

module.exports.handleJiraCredentials = (request, reply) => {
	consumer.getOAuthRequestToken(
		(error, oauthToken, oauthTokenSecret, results) => {
			if (!request.query.oauth_token) {
				console.log(error);
				if (error) {
                    return reply(Boom.badData('Error getting OAuth access token'));
				}
				else {
					return reply.redirect(config.jira.url + "plugins/servlet/oauth/authorize?oauth_token=" + oauthToken);
				}
			}

			if (!request.query.oauth_verifier) {
                return reply(Boom.badData('No OAuth verifier'));
			} else {
				consumer.getOAuthAccessToken (request.query.oauth_token, oauthTokenSecret, request.query.oauth_verifier,
					(error, oauthAccessToken, oauthAccessTokenSecret, results) => {
						if (error) {
                            return Boom.wrap(error, 400);
						}
						else {
							if(request.auth.isAuthenticated && request.auth.credentials) {
                                User.findOne({userId: request.auth.credentials.id}).exec()
                                .then((user) => {
                                     user.jiraOAuthToken = oauthAccessToken;
                                     user.jiraOAuthSecret = oauthAccessTokenSecret;

                                     return user.save();
                                })
                                .then((response) => {
                                     if(response) {
                                         return reply.redirect('/account');
                                     } else {
                                         return reply(Boom.badData('No User found'));
                                     }
                                })
                                .catch((error) => {
                                    return Boom.wrap(error, 401);
                                });
							} else {
                                return reply(Boom.unauthorized());
							}
						}
					}
				);
			}
		}
	);
};

module.exports.getAccount = (request, reply) => {
	if(request.auth.isAuthenticated && request.auth.credentials){

		User.findOne({userId: request.auth.credentials.id}).exec()
	  		.then((response) => {
	  			if(response) {
					console.log('getaccount');
	  				let user = {
  						team: response.slackTeamName,
  						username: response.slackUserName,
  						jiraname: response.jiraUserName
	  				};

	  				return reply({success: true, user: user});
	  			} else {
	  				return reply({success: false, msg: "Unable to retrieve profile information"});	
	  			}
	    		
	  		})
	  		.catch((error) => {
	  			return reply({success: false, msg: "Unable to retrieve profile information"});
	  		});
	} else {
		return reply({success: false, msg: "UnauthorizedError: private profile"});	
	}
};

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
};

module.exports.authenticate = (request, reply) => {
	console.log('authentications');
	console.log(request);
	//return reply.redirect('/login');
};