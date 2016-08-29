'use strict'

const config = require('../config'),
	jwt = require('jsonwebtoken');

module.exports.createToken = (user) => {
	let expiration = new Date();
	expiration.setDate(expiration.getDate() + 7);
	return jwt.sign({ id: user._id, expiration: parseInt(expiration.getTime() / 1000)}, config.jwtSecret, { algorithm: 'HS256', expiresIn: "1h" } );
}