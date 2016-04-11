'use strict';
const Boom = require('boom');
const req = require('request');
const config = require('../config');
var options = {
	headers: {
		'X-Atlassian-Token': 'no-check',
		'Content-Type': 'application/json',
		'Authorization': 'Basic ' + new Buffer(config.jira.username + ":" + config.jira.password).toString('base64')
	},	
};

function getRequest(options) {
	return new Promise((resolve, reject) => {
	    req(options, function(err, httpResponse, body) {

			if (err) {
				return reject(new Error(err));
			}

			if (httpResponse.statusCode === 200) {
				return resolve(JSON.parse(body));
			}

			if (httpResponse.statusCode === 404) {
				return reject(new Error('404 Response'));
			}

			return reject(new Error('Not OK Response'));
	    });
  	});		
}

function postRequest(options) {
	return new Promise((resolve, reject) => {
	    req.post(options, function(err, httpResponse, body) {
			if (err) {
				return reject(new Error(err));
			}

			if (httpResponse.statusCode === 200) {
				return resolve(JSON.parse(body));
			}

			if (httpResponse.statusCode === 204) {
				return resolve();	
			}

			return reject(new Error('Not OK Response'));
	    });
  	});		
}

function isNumber (o) {
  return ! isNaN (o-0) && o !== null && o !== "" && o !== false;
}

function queryTransitions (issue) {
	var opts = Object.create(options);
	opts.url = config.jira.url + 'rest/api/2/issue/'+issue+'/transitions?expand=transitions.fields';
	return getRequest(opts);
}

module.exports.retrieveTransitions = function(issue) {
	return queryTransitions(issue)
		.then((result) => {
	        var message = {
	          "response_type": "ephemeral",
	          "text": "Transition states available for the issue <" + config.jira.url + 'browse/' + issue + '|' + issue + '>',
	          'attachments': []
	        };

	        message.attachments = result.transitions.map(function(transition){
	          return {
	            'fallback': 'Name: ' + transition.name + ' ID: ' + transition.id + ': ' + transition.to.description,
	            'title': 'Name: ' + transition.name + ' ID: ' + transition.id, 
	            'text': transition.to.description,
	            'color': mappedColors(transition.to.statusCategory.colorName)
	          }

	        });

	        if (message.attachments.length === 0) {
	          message.text += '\nThat issue does not exist';
	        }

	        return JSON.stringify(message);
	    })
	    .catch((err) => {
	    	console.log(err);
	    	return 'error';
	    });
}

module.exports.issueDetails = function(issue){
	var opts = Object.create(options);
	opts.url = config.jira.url + '/rest/api/2/issue/'+issue;

	return getRequest(opts)
		.then((result) => {
			var updated = new Date(result.fields.updated).toLocaleString(),
            message = {
	          'response_type': 'ephemeral',
	          'attachments' : [{
	            'pretext': 'Task <' + config.jira.url + 'browse/' + issue + '|' + issue + '>',
	            'title': result.fields.summary,
	            'text': result.fields.description,
	            'fields': [{
	                'title': 'Assignee',
	                'value': result.fields.assignee.displayName,
	                'short': true
	              },
	              {
	                'title': 'Reporter',
	                'value': result.fields.reporter.displayName,
	                'short': true
	              },
	              {
	                'title': 'Type',
	                'value': result.fields.issuetype.name,
	                'short': true
	              },
	              {
	                'title': 'Status',
	                'value': result.fields.status.statusCategory.name,
	                'short': true
	              },
	              {
	                'title': 'Last Updated',
	                'value': updated,
	                'short': true
	              }
	            ],
	          'color': '#F35A00'
	          }]
	        };

	        return JSON.stringify(message);
		})
		.catch((err) => {
			return 'error';
		});
}

module.exports.transitionIssue = function(args) {
	var subCommand = args.split(/\s+/).slice(0,1);
	args = args.replace(subCommand[0], '').trim();

	return queryTransitions(subCommand[0])
		.then((result) => {
			var statusId = args,
				opts = Object.create(options);

			if(!isNumber(args)) {
				var status = result.transitions.find((state) => {
					return state.name.toLowerCase() === args.toLowerCase();
				});	
				statusId = status.id;
			}

			opts.url = config.jira.url + 'rest/api/2/issue/'+subCommand[0]+'/transitions?expand=transitions.fields';
			opts.json = {"transition": { "id": statusId }};
		
			return postRequest(opts);
		})
		.then((result) => {
			var message = {
          		"response_type": "ephemeral",
          		"text": "Issue  <" + config.jira.url + 'browse/' + args + '|' + args + '> has been updated to *something*',
        	};
			return JSON.stringify(message);
		})
		.catch((err) => {
			console.log(err);
			return 'error';
		});
}

module.exports.queryIssues = function(query) {
	var opts = Object.create(options);
	opts.url = encodeURI(config.jira.url + 'rest/api/2/search?jql=assignee in ("'+query+'")');

	return getRequest(opts)
		.then((result) => {
			var message = {
	          "response_type": "ephemeral",
	          "text": "Issues assigned to: *" + query + "*",
	          'attachments': []
	        };

	      message.attachments = result.issues.map(function(issue){
	        return {
	          'fallback': 'Task ' + issue.key + ' ' + issue.fields.summary + ' ' + issue.fields.description + ': ' + config.jira.url + 'browse/' + issue.key,
	          'pretext': 'Task <' + config.jira.url + 'browse/' + issue.key + '|' + issue.key + '>',
	          'title': issue.fields.summary,
	          'text': issue.fields.description,
	          'color': '#F35A00'
	        }
	      });

	      if (message.attachments.length === 0) {
	        message.text += '\nNo issues found';
	      }

	      return JSON.stringify(message);
		})
		.catch((err) => {
			return 'error';
		});
}

module.exports.help = function() {
}