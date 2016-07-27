'use strict'

const Boom = require('boom'),
User = require('../models/User'),
config = require('../config'),
jwt = require('jsonwebtoken'),
Joi = require('joi'),
bcrypt = require('bcryptjs');

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
	return jwt.sign({ id: user._id, email: user.email}, config.jwtSecret, { algorithm: 'HS256', expiresIn: "1h" } );
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