'use strict'

const Boom = require('boom'),
	User = require('../models/User'),
	ConnectRequest = require('../models/ConnectRequest'),
	config = require('../config'),
	jwt = require('jsonwebtoken'),
	Joi = require('joi'),
	bcrypt = require('bcryptjs');

function findRegistrationToken(token) {
	return ConnectRequest.findOne({connect_token: token}).exec();	
}

module.exports.isUniqueUser = (email) => {

	User.findOne({ email: email}, 
		(err, user) => {
    // Check whether the jira username or email
    // is already taken and error out if so
    if (user) {
    	if (user.email === email) {
    		return false;
    	}
    }

    return true;
});
}

module.exports.createToken = (user) => {
	let expiration = new Date();
	expiration.setDate(expiration.getDate() + 7);
	console.log('user');
	console.log(user);
	console.log(config.jwtSecret);
	return jwt.sign({ id: user._id, email: user.email, expiration: parseInt(expiration.getTime() / 1000)}, config.jwtSecret, { algorithm: 'HS256', expiresIn: "1h" } );
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

module.exports.tokenMessage = (token) => {
	let currentDate = new Date();
	
	if(!token) {
    	return {success: false, msg: "The supplied registration token does not exist."};		
    } else if(token.delete_at - currentDate < 0) {
    	return {success: false, msg: "The supplied registration token has expired."};	
    } else if(token.spent) {
    	return {success: false, msg: "The supplied registration token has already been used."};	
    } else {
    	return {success: true, email: token.email};		
    } 
};

module.exports.registrationRequest = (request, reply) => {
	ConnectRequest.findOne({connect_token: request.payload.token}).exec()
		.then((response) => {
			return reply(module.exports.tokenMessage(response));
		}).catch((error) => {
			return reply({success: false, msg: "There was an error verifying your token. Please try again"});
		});
}