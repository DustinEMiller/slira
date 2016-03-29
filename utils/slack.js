'use strict';

const request = require('request');
const camelCase = require('camelcase-keys-recursive');

var internals = {};

module.exports = internals.Slack = function(options) {
  this.token = options.token;
};

internals.Slack.prototype.getUserInfo = function(userId) {
  const url = `https://slack.com/api/users.info?token=${this.token}&user=${userId}`;
  return internals.getRequest(url);
};


internals.getRequest = function(url) {

  return new Promise((resolve, reject) => {

    request(url, function(err, httpResponse, body) {
      if (err) {
        return reject(err);
      }

      if (httpResponse.statusCode === 200) {
        return resolve(camelCase(JSON.parse(body)));
      }

      reject('Not OK Response');

    });

  });

};