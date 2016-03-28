'use strict';
var getEnv = require('getenv');

module.exports = {
  port: getEnv.int('PORT', 3000),
  mongo:{
    username: getEnv('MONGO_USERNAME', ''),
    password: getEnv('MONGO_PASSWORD', ''),
    url: getEnv('COUCHDB_URL', 'http://127.0.0.1'),
    port: getEnv.int('MONGO_PORT', 5984),
    dbName: getEnv('MONGO_NAME', '')
  },
  slack:{
    token: getEnv('SLACK_TOKEN', ''),
    webhooks:{
      requestTokens: getEnv('SLACK_WEBHOOK_TOKENS', '').split(',')
    }
  },
  jira:{
    username: getEnv('JIRA_USERNAME', ''),
    password: getEnv('JIRA_PASSWORD', ''),
    url: getEnv('JIRA_URL', 'http://127.0.0.1'),
  }
};