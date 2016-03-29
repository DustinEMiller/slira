'use strict';
//const Joi = require('joi');
const jira = require('./controllers/jira');


module.exports = [
  {
    path:'/webhooks/slack',
    method:'POST',
    handler: jira.slackHook,
  }
];