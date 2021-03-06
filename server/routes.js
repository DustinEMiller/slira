'use strict'

const jira = require('./controllers/jira'),
	user = require('./controllers/user'),
	Joi = require('joi'),
	userUtils = require('./utils/user'),
	slackState = require('./models/SlackState');


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
<<<<<<< HEAD
		method: 'POST',
		handler: user.login,
		config: {
			validate: {
			  	payload: Joi.object({
					email: Joi.string().email().required(),
					password: Joi.string().required()
				})
			}  
=======
		method: ['GET', 'POST'],
		config: {
			handler: (request, reply) => {
				console.log(request);
				if (!request.auth.isAuthenticated) {
                    return reply('Authentication failed due to: ' + request.auth.error.message);
                }

                // Perform any account lookup or registration, setup local session,
                // and redirect to the application. The third-party credentials are
                // stored in request.auth.credentials. Any query parameters from
                // the initial request are passed back via request.auth.credentials.query.
                return reply.redirect('/home');
			}
>>>>>>> dev
		}
	},
	{
		path: '/api/slack/state',
		method: 'GET',
		handler: (request, reply) => {
			return slackState.save()
				.then((result) => {
					return reply({success: true , msg: result.code});
				})
				.catch((error) => {
					return reply({success: false , msg: 'There was an issue creating the proper link.'});
				});
		}
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
    	},
  	},
  	{
    	method: 'GET', 
    	path: '/slack',
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