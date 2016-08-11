'use strict'

const Boom = require('boom'),
User = require('../models/User'),
ConnectRequest = require('../models/ConnectRequest'),
config = require('../config'),
jwt = require('jsonwebtoken'),
Joi = require('joi'),
bcrypt = require('bcryptjs');

function tokenMessage(token) {
	if(!token) {
    	return {success: false, msg: "The supplied registration token does not exist."};		
    } else if(token.delete_at - currentDate < 0) {
    	return {success: false, msg: "The supplied registration token has expired."};	
    } else if(token.spent) {
    	return {success: false, msg: "The supplied registration token has already been used."};	
    } else {
    	return {success: true, email: token.email};		
    } 
}

module.exports.verifyUniqueUser = (request, reply) => {

	User.findOne({
		$or: [
		{ email: request.payload.email },
		{ jiraUserName: request.payload.jiraUserName }
		]
	}, (err, user) => {
    // Check whether the jira username or email
    // is already taken and error out if so
    if (user) {
    	if (user.email === request.payload.email) {
    		return reply(Boom.badRequest('Email taken'));
    	}
    	if (user.jiraUserName === request.payload.jiraUserName) {
    		return reply(Boom.badRequest('Username taken'));
    	}
    }

    return reply(request.payload);
});
}

module.exports.createToken = (user) => {
	let expiration = new Date();
	expiration.setDate(expiration.getDate() + 7);
	
	return jwt.sign({ id: user._id, email: user.email, expiration: parseInt(expiration.getTIme() / 1000)}, config.jwtSecret, { algorithm: 'HS256', expiresIn: "1h" } );
}

module.exports.verifyCredentials = (request, reply) => {

	User.findOne({
		email: request.payload.email
	}, (err, user) => {
		if (user) {
			bcrypt.compare(request.payload.password, user.password, (err, isValid) => {
				if (isValid) {
					return reply(user);
				}
				else {
					return reply(Boom.badRequest('Incorrect password!'));
				}
			});
		} else {
			return reply(Boom.badRequest('Incorrect email!'));
		}
	});
}

module.exports.registrationRequest = (request, reply) => {
	ConnectRequest.findOne({connect_token: request.payload.token}, (err, token) => {

	    if(err) {
	    	return reply({success: false, msg: "There was an error verifying your token. Please try again"});	
	    }
	    // Change from status string to success true or false with messages
	    let currentDate = new Date();

	    return reply(this.tokenMessage(token));  
	});
}