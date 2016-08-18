'use strict'

const jira = require('./controllers/jira'),
	user = require('./controllers/user'),
	Joi = require('joi'),
	userUtils = require('./utils/user');


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
		path: '/api/user/create',
		method: 'POST',
		handler: user.addNew,
		config: {
			validate: {
				payload: {
					email: Joi.string().email(),
					password: Joi.string().required().min(6),
					token: Joi.string().required()
				} 	
			}
		}
	},
	{
		path: '/api/user/authenticate',
		method: 'POST',
		handler: user.login,
		config: {
			validate: {
			  	payload: Joi.object({
					email: Joi.string().email().required(),
					password: Joi.string().required()
				})
			}  
		}
	},
	{
		path:'/api/user/registrationRequest',
		method:'POST',
		handler: userUtils.registrationRequest
	},
	{
		path: '/api/user/information',
		method: 'GET',
		config: {
			handler: (request, reply) => {
	  			//reply({ token: userUtils.createToken(request.pre.user) }).code(201);
			},
			auth: {
	      		strategy: 'jwt'
	    	}	
		}	
	},
	{
		path: '/api/user/information',
		method: 'POST',
		config: {
			handler: (request, reply) => {
	  			//reply({ token: userUtils.createToken(request.pre.user) }).code(201);
			},
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
    	path: '/login',
		handler: function(request, reply){
      		reply.file('index.html')
    	}
  	},
  	{
    	method: 'GET', 
    	path: '/register/{connectToken}',
		handler: function(request, reply){
      		reply.file('index.html')
    	}
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