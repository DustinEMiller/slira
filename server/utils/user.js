'use strict'

const Boom = require('boom'),
	User = require('../models/User'),
	ConnectRequest = require('../models/ConnectRequest'),
	config = require('../config'),
	jwt = require('jsonwebtoken'),
	Joi = require('joi');

function findRegistrationToken(token) {
	return ConnectRequest.findOne({connect_token: token}).exec();	
}

module.exports.createToken = (user) => {
	let expiration = new Date();
	expiration.setDate(expiration.getDate() + 7);
	return jwt.sign({ id: user._id, email: user.email, expiration: parseInt(expiration.getTime() / 1000)}, config.jwtSecret, { algorithm: 'HS256', expiresIn: "1h" } );
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