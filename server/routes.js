'use strict'

const jira = require('./controllers/jira'),
	user = require('./controllers/user'),
	Joi = require('joi'),
	userUtils = require('./utils/user'),
	config = require('./config');

module.exports = [
	{
		path:'/webhooks/slack',
		method:'POST',
		handler: jira.slackHook,
	},
	{
		path:'/webhooks/issueUpdated',
		method:'POST',
		handler: jira.issueUpdatedHook,
	},
	{
		path: '/api/user/information',
		method: 'GET',
		config: {
			handler: user.getAccount,
			auth: {
	      		strategy: 'jwt'
	    	}	
		}	
	},
	{
    	method: 'GET', 
    	path: '/login/slack',
		config: {
    		auth: 'slack',
    		handler: user.handleLogin
    	},
  	},
  	{
    	method: 'GET', 
    	path: '/',
		handler: function(request, reply) {
      		reply.file('index.html');
    	}
  	},
  	{
    	method: 'GET', 
    	path: '/login',
		handler: function(request, reply) {
			//console.log(request);
      		reply.file('index.html');	
    	}
    	
  	},
  	{
    	method: 'GET', 
    	path: '/account',	
    	config: {
    		auth: 'session',
    		handler: function(request, reply) {
    			console.log(request.auth.credentials);
  				reply.file('index.html');
			}
    	}
  	},
  	{
    	method: 'GET', 
    	path: '/{param*}',
		handler: {
          	directory: {
				path: './../public',
				redirectToSlash: true,
				index: false
      		}
      	}
  	},
];