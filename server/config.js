'use strict';
var getEnv = require('getenv');

module.exports = {
  	//3001
	port: getEnv.int('SLIRA_PORT', 3000),
  url: getEnv('SLIRA_URL', 'http://localhost:3000'),
	slack:{
	    token: getEnv('SLACK_TOKEN', ''),
      password: getEnv('SLACK_OAUTH_PASSWORD','default')
      oauthSecret: getEnv('SLACK_OAUTH_SECRET', '')
	    webhooks:{
      		requestTokens: getEnv('SLIRA_SLACK_WEBHOOK_TOKENS', '').split(',')
	    }
  	},
  	jira:{
		username: getEnv('JIRA_USERNAME', ''),
	    password: getEnv('JIRA_PASSWORD', ''),
	    url: getEnv('SIRA_URL', 'http://54.244.59.52/'),
  	},
  	mongo: {
  		url: getEnv('SLIRA_MONGO_URL', 'mongodb://localhost:27017/slira-dev')
  	},
  	jwtSecret: getEnv('SLIRA_JWT_SECRET', 'default')
};