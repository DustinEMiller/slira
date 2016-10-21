'use strict'

const jira = require('./controllers/jira');
const user = require('./controllers/user');

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
			auth: 'session',
			handler: user.getAccount
		}	
	},
	{
		path: '/api/jira/check',
		method: 'GET',
		config: {
			auth: 'session',
			handler: jira.checkUser
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
		path: '/login/jira',
		config: {
			auth: 'session',
			handler: user.handleJiraCredentials
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
		path: '/loginError',
		handler: function(request, reply) {
			reply.file('index.html'); 
		}
		
	},
	{
		method: 'GET', 
		path: '/unauthorized',
		handler: function(request, reply) {
			reply.file('index.html'); 
		}
		
	},
    {
		method: 'GET', 
		path: '/denied',
		handler: function(request, reply) {
			reply.file('index.html'); 
		}
		
	},
    {
		method: 'GET', 
		path: '/notFound',
		handler: function(request, reply) {
			reply.file('index.html'); 
		}
		
	},
	{
		method: 'GET', 
		path: '/account',	
		config: {
			auth: 'session',
			handler: function(request, reply) {
				reply.file('index.html');
			}
		}
	},
	{
		method: 'GET', 
		path: '/logout',	
		config: {
			auth: 'session',
			handler: function(request, reply) {
				request.cookieAuth.clear();
				reply('bye bye');
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