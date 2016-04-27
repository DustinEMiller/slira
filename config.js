'use strict';
var getEnv = require('getenv');

module.exports = {
  port: getEnv.int('PORT', 3001),
  slack:{
    token: getEnv('SLACK_TOKEN', ''),
    webhooks:{
      requestTokens: getEnv('SLIRA_SLACK_WEBHOOK_TOKENS', '').split(',')
    }
  },
  jira:{
    username: getEnv('JIRA_USERNAME', ''),
    password: getEnv('JIRA_PASSWORD', ''),
    url: getEnv('JIRA_URL', 'http://127.0.0.1'),
  }
};