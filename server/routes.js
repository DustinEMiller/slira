'use strict'

const jira = require('./controllers/jira'),
	user = require('./controllers/user'),
	Joi = require('joi'),
	userUtils = require('./utils/user'),
	SlackState = require('./models/SlackState');


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
		method: ['GET', 'POST'],
		config: {
			auth: 'slack',
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
		}
	},
	{
		path: '/api/slack/state',
		method: 'GET',
		handler: (request, reply) => {
			let slackRequest = new SlackState();
			return slackRequest.save()
				.then((result) => {
					return reply({success: true , state: result.state});
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
    	method: 'GET', 
    	path: '/',
		handler: function(request, reply){
      		reply.file('index.html')
    	}
  	},
  	{
    	method: 'GET', 
    	path: '/login',
		config: {
    		auth: 'slack',
    		handler: function(request, reply){
    			console.log(request);
    			//console.log(request.auth.credentials.profile);
      			reply.file('index.html');
    		}
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