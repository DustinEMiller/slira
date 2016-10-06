'use strict'

const User = require('../models/User'),
	req = require('request'),
	Boom = require('boom'),
	config = require('../config'),
	userUtils = require('../utils/user'),
	bcrypt = require('bcryptjs'),
    fs = require('fs');

module.exports.handleLogin = (request, reply) => {
	let user = new User(),
		userCheck,
		credentials = request.auth.credentials,
		token;

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

module.exports.handleJiraLogin = (request, reply) => {
	console.log(request);
    let privateKey = fs.readFileSync('/etc/ssl/certs/slira-key.pem', 'utf8');
    let options = {
        rejectUnauthorized: true,
        uri: 'https://jira.healthalliance.org/rest/api/2/issue/EXPLORE-16',
        method: 'GET',
        oauth: {
            consumer_key: 'slira',
            consumer_secret: privateKey,
            token: request.auth.credentials.token,
            token_secret: request.auth.credentials.secret    
        }
    };
    
    req(options, function(err, httpResponse, body) {
        console.log(httpResponse);
        return reply.redirect('/account');
    });
    
    
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


    User.findOne({userId: request.auth.credentials.id}).exec()
        .then((user) => {
            if (request.payload.password) {
                user.jiraUserName = request.payload.username;    
            } else if (request.payload.username) {
                user.jirPassword = request.payload.password;    
            }

            return user.save().exec();
        })
        .then((response) => {
            if(response) {
                return reply(200);    
            } else {
                return reply(400);    
            }

        })
        .catch((error) => {
            return reply(400);
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