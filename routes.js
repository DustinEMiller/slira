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
			pre: [
				{method: userUtils.verifyUniqueUser}
			],
			validate: {
				payload: {
					email: Joi.string().email(),
					password: Joi.string().required(),
					jiraUserName: Joi.string().min(2),
					jiraPassword: Joi.string().required(),
					slackUserName: Joi.string().required()
				} 	
			}
		}
	},
	{
		path: '/api/user/authenticate',
		method: 'POST',
		handler: (request, reply) => {
	  		reply({ token: userUtils.createToken(request.pre.user) }).code(201);
		},
		config: {
			pre: [
			  {method: userUtils.verifyCredentials, assign: 'user'}
			],
			validate: {
			  	payload: Joi.object({
					email: Joi.string().email().required(),
					password: Joi.string().required()
				})
			}  
		}
	}
	{
		path: '/{param}',
		method: 'GET',
		handler: {
			directory: {
				path: Path.join(__dirname, 'client')
			}
		}
	}
];