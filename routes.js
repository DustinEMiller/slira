'use strict';
const Joi = require('joi');
const employee = require('./controllers/employee');
'use strict';
//const Joi = require('joi');
const employee = require('./controllers/jira');


module.exports = [
  {
    path:'/webhooks/slack',
    method:'POST',
    handler: jira.slackHook,
  }
];