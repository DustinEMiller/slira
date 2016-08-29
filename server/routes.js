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
    	path: '/',
		handler: function(request, reply){
      		reply.file('index.html')
    	}
  	},
  	{
    	method: 'GET', 
    	path: '/login/slack',
		config: {
    		auth: 'slack',
    		handler: function(request, reply){
    			//user.handleLogin
    			console.log(request.auth);
      			reply.redirect(config.url+'/account');
    		}
    	},
  	},
  	{
    	method: 'GET', 
    	path: '/account',
		handler: function(request, reply){
      		reply.file('index.html')
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