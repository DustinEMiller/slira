'use strict';
var getEnv = require('getenv');

module.exports = {
  port: getEnv.int('PORT', 3000),
  mongo:{
    username: getEnv('SLIRA_MONGO_USERNAME', ''),
    password: getEnv('SLIRA_MONGO_PASSWORD', ''),
    url: getEnv('SLIRA_MONGO_URL', 'http://127.0.0.1'),
    port: getEnv.int('SLIRA_MONGO_PORT', 5984),
    dbName: getEnv('SLIRA_MONGO_NAME', '')
  },
  slack:{
    token: getEnv('SLIRA_SLACK_TOKEN', ''),
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