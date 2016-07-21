'use strict';
var getEnv = require('getenv');

module.exports = {
  	//3001
	port: getEnv.int('PORT', 3000),
	slack:{
	    token: getEnv('SLACK_TOKEN', ''),
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