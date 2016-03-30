'use strict';

const request = require('request');
const camelCase = require('camelcase-keys-recursive');

var internals = {};

module.exports = internals.Slack = function(options) {
  this.token = options.token;
};