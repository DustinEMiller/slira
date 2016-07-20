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
	    url: getEnv('JIRA_URL', 'http://127.0.0.1'),
  	},
  	mongo: {
  		url: getEnv('SLIRA_MONGO_URL', '');
  	},
  	jwtSecret: getEnv('SLIRA_JWT_SECRET', 'default')
};