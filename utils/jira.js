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
},
	command = '/jira';

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
				return reject('404');
			}

			return reject('not');
	    });
  	});		
}

function postRequest(options) {
	return new Promise((resolve, reject) => {
	    req.post(options, function(err, httpResponse, body) {
	    	console.log(httpResponse);
	    	console.log(JSON.parse(body));
			if (err) {
				return reject(new Error(err));
			}

			if (httpResponse.statusCode === 200) {
				return resolve(JSON.parse(body));
			}

			if (httpResponse.statusCode === 204) {
				return resolve();	
			}

			if (httpResponse.statusCode === 404) {
				return reject('404');
			}

			return reject('not');
	    });
  	});		
}

function isNumber (o) {
  return ! isNaN (o-0) && o !== null && o !== "" && o !== false;
}

function mappedColors(color) {
	var colors = {
	    "blue-gray":"#2E3D54",
	    "yellow":"#F6C342",
	    "green":"#14892C"
	};

	if (typeof colors[color.toLowerCase()] != 'undefined')
	    return colors[color.toLowerCase()];

	return "#000000";
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
	    	var message = {text: err};

	    	if (issue === '') {
	    		message.text = 'No issue name or ID detected in your command. Please type `'+command+' help` for assistance.';
	    	} else if (err == '404') {
	    		message.text = 'Issue '+issue+' does not exist. Please type `'+command+' help` for assistance.';	
	    	}

	    	console.log(err);
	    	return JSON.stringify(err);
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
			var message = {text: err};
			if (err = '404') {
				message.text = 'Issue \''+issue+'\' does not exist. Please type `'+command+' help` for assistance.';
			} else {
				message.text = 'There was an unknown issue with that command. Please contact the administrator if you continue to see this message or type `'+command+' help` for further assistance.'
			}
			console.log(err);
			return JSON.stringify(message);
		});
}

module.exports.transitionIssue = function(args) {
	var issue = args.split(/\s+/).slice(0,1);
	args = args.replace(issue[0], '').trim();

	return queryTransitions(issue[0])
		.then((result) => {
			var statusId = args,
				opts = Object.create(options);

			if(!isNumber(args)) {
				var status = result.transitions.find((state) => {
					return state.name.toLowerCase() === args.toLowerCase();
				});	
				statusId = status.id;
			}

			opts.url = config.jira.url + 'rest/api/2/issue/'+issue[0]+'/transitions?expand=transitions.fields';
			opts.json = {"transition": { "id": statusId }};
		
			return postRequest(opts);
		})
		.then((result) => {
			console.log(result);
			var message = {
          		"response_type": "ephemeral",
          		"text": "Issue  <" + config.jira.url + 'browse/' + args + '|' + args + '> has been updated to *something*',
        	};
			return JSON.stringify(message);
		})
		.catch((err) => {
			var message = {text: err};
			if (issue[0] === '') {
				message.text = 'No issue detected in your command. Please type `'+command+' help` for assistance.';
			} else if (args === '') {
				message.text = 'No transition name or ID detected in your command. Please type `'+command+' help` for assistance.';
			}

			console.log(err);
			return JSON.stringify(err);
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

	        if (query === '') {
	        	message.text = 'No user string found in command. Type `'+command+' help` to get details on how to use this command.'
	        } else {
	        	message.attachments = result.issues.map(function(issue) {
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
	        }

	      	return JSON.stringify(message);
		})
		.catch((err) => {
			console.log(err);
			return JSON.stringify(err);
		});
}

module.exports.help = function(isIntentional) {
	var message = {
      	"response_type": "ephemeral",
      	"text": command + " help topics.",
      	'attachments': []
    };

    if(!isIntentional) {
    	message.text = 'That command does not exist. Here are the ' + command + ' help topics.';	
    }

    message.attachments = [{
    	'fallback': 'Viewing issues assigned to user.' + '`'+ command + ' i [name]`',
        'pretext': 'Viewing issues assigned to user.',
        'title': '`' + command + ' i [name]`',
        'text': 'Ex: `'+ command + ' i Barry Allen` Displays all the issues assigned to the user inside `[name]`. You may search for JIRA username or their real name, if it is set inside JIRA. \"Fuzzy\" matching does not work. Fully qualified names must be used.',
        'color': '#974A50'	
    },
	{
    	'fallback': 'Viewing details of an issue.' + '`'+ command + ' d [issueIDorKey]`',
        'pretext': 'Viewing details of an issue.',
        'title': '`' + command + ' d [issueIDorKey]`',
        'text': 'Ex: `'+command+' d COMM-4` Displays title, summary, assignee, reporter, type, status and last update for the value given inside [issueIDorKey].',
        'color': '#617C51'	
    },
    {
    	'fallback': 'Viewing valid transition states for an issue.' + '`'+ command + ' s [issueIDorKey]`',
        'pretext': 'Viewing valid transition states for an issue.',
        'title': '`' + command + ' s [issueIDorKey]`',
        'text': 'Ex: `'+command+' s COMM-4` Displays the ID and name for the transitional states available for [issueIDorKey]',
        'color': '#D6B25E'	
    },
    {
    	'fallback': 'Update status of an issue.' + '`'+ command + ' t [issueIdOrKey] [statusNameOrId]`',
        'pretext': 'Update status of an issue.',
        'title': '`' + command + ' t [issueIdOrKey] [statusNameOrId]`',
        'text': 'Ex: `'+command+' t COMM-4 In Progress` Changes the status of issue. Both [issueIdOrKey] AND [statusNameOrId] must be present. To see valid states for an issue, see `'+command+' s`',
        'color': '#E6E2EE'	
    }];

    return message;
}