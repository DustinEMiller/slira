'use strict';

const request = require('request');
const camelCase = require('camelcase-keys-recursive');

module.exports = internals.Slack = function(options) {
  this.token = options.token;
};