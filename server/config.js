'use strict';
var getEnv = require('getenv');

module.exports = {
  	//3001
	port: getEnv.int('SLIRA_PORT', 3000),
  url: getEnv('SLIRA_URL', 'http://localhost:3000'),
	slack:{
	    token: getEnv('SLACK_TOKEN', ''),
      password: getEnv('SLIRA_OAUTH_PASSWORD','dlksjdgjinrimirmnginhcoihgirhjgijcobpsdkgowkr'),
      clientId: getEnv('SLIRA_CLIENT_ID','13949143637.72058318581'),
      oauthSecret: getEnv('SLIRA_OAUTH_SECRET', ''),
	    webhooks:{
      		requestTokens: getEnv('SLIRA_SLACK_WEBHOOK_TOKENS', '').split(',')
	    }
  	},
  	jira:{
		username: getEnv('JIRA_USERNAME', ''),
	    password: getEnv('JIRA_PASSWORD', ''),
	    url: getEnv('JIRA_URL', 'http://localhost'),
  	},
  	mongo: {
  		url: getEnv('SLIRA_MONGO_URL', 'mongodb://localhost:27017/slira-dev')
  	},
    jwtSecret: getEnv('SLIRA_JWT_SECRET', 'default')
};