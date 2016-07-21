'use strict'

const jira = require('./controllers/jira'),
	user = require('./controllers/user'),
	Joi = require('joi');


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
		path: '/api/users',
		method: 'POST',
		handler: user.addNew,
		config: {
			validate: {
				payload: {
					userName: Joi.string().min(2),
					password: Joi.string().required(),
					slackUserName: Joi.string().required()
				} 	
			}
		}
	}
];