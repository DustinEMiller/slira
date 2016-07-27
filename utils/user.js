'use strict'

const Boom = require('boom'),
  User = require('../models/User'),
  config = require('../config'),
  jwt = require('jsonwebtoken');

module.exports.verifyUniqueUser = (req, res) => {

  User.findOne({
    $or: [
      { email: req.payload.email },
      { jiraUserName: req.payload.jiraUserName }
    ]
  }, (err, user) => {
    // Check whether the jira username or email
    // is already taken and error out if so
    if (user) {
      if (user.email === req.payload.email) {
        return res(Boom.badRequest('Email taken'));
      }
      if (user.jiraUserName === req.payload.jiraUserName) {
        return res(Boom.badRequest('Username taken'));
      }
    }

    return res(req.payload);
  });
}

module.exports.createToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email}, config.jwtSecret, { algorithm: 'HS256', expiresIn: "1h" } );
}

module.exports.verifyCredentials = (req, res) => {

  User.findOne({
    $or: [
      { email: req.payload.email },
      { jiraUserName: req.payload.jiraUserName }
    ]
  }, (err, user) => {
    if (user) {
      bcrypt.compare(password, user.password, (err, isValid) => {
        if (isValid) {
            return res(user);
        }
        else {
          return res(Boom.badRequest('Incorrect password!'));
        }
      });
    } else {
      return res(Boom.badRequest('Incorrect username or email!'));
    }
  });
}