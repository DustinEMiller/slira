'use strict';

const req = require('request'),
	config = require('../config'),
	SlackState = require('../models/SlackState');

let options = {
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
				if (err.errorMessages.toLowerCase() === 'issue does not exist') {
	    			return reject('noexist');
	    		} else {
	    			return reject(new Error(err));
	    		}
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
			console.log(httpResponse.statusCode);
			console.log(err);
			return reject('not');
	    });
  	});		
}

function isNumber (o) {
  return ! isNaN (o-0) && o !== null && o !== "" && o !== false;
}

function mappedColors(color) {
	let colors = {
	    "blue-gray":"#2E3D54",
	    "yellow":"#F6C342",
	    "green":"#14892C"
	};

	if (typeof colors[color.toLowerCase()] != 'undefined')
	    return colors[color.toLowerCase()];

	return "#000000";
}

function queryTransitions (issue) {
	let opts = Object.create(options);
	opts.url = config.jira.url + 'rest/api/2/issue/'+issue+'/transitions?expand=transitions.fields';
	return getRequest(opts);
}

module.exports.setCommand = (cmd) => {
	command = cmd;
}

module.exports.retrieveTransitions = (issue) => {
	return queryTransitions(issue)
		.then((result) => {
	        let message = {
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
	    	let message = {text: err.toString()};

	    	if (issue === '') {
	    		message.text = 'No issue name or ID detected in your command. Please type `'+command+' help` for assistance.';
	    	} else if (err === 'noexist' || err === 'not' || err === '404') {
	    		message.text = 'Issue `'+issue+'` does not exist. Please type `'+command+' help` for assistance.';	
	    	}

	    	console.log(err);
	    	return JSON.stringify(message);
	    });
}

module.exports.issueDetails = (issue) => {
	let opts = Object.create(options);
	opts.url = config.jira.url + '/rest/api/2/issue/'+issue;

	return getRequest(opts)
		.then((result) => {
			let updated = new Date(result.fields.updated).toLocaleString(),
				message,
				assigneeName = 'Unassigned';

			if(result.fields.assignee) {
				assigneeName = result.fields.assignee.displayName;
			}

            message = {
	          'response_type': 'ephemeral',
	          'attachments' : [{
	            'pretext': 'Task <' + config.jira.url + 'browse/' + issue + '|' + issue + '>',
	            'title': result.fields.summary,
	            'fields': [{
	                'title': 'Assignee',
	                'value': assigneeName,
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
	          'color': '#617C51'
	          }]
	        };

	        return JSON.stringify(message);
		})
		.catch((err) => {
			let message = {text: err.toString()};

			if (issue === '') {
				message.text = 'No issue ID or key present in command. Type `/jira help` to get details on how to use this command.';
			} else if (err === 'noexist'|| err === 'not' || err === '404') {
				message.text = 'Issue `'+issue+'` does not exist. Please type `'+command+' help` for assistance.';
			} else {
				message.text = 'There was an unknown issue with that command. Please contact the administrator if you continue to see this message or type `'+command+' help` for further assistance.'
			}
			console.log(err);
			return JSON.stringify(message);
		});
}

module.exports.transitionIssue = (args) => {
	let issue = args.split(/\s+/).slice(0,1),
		status = args.replace(issue[0], '').trim();

	return queryTransitions(issue[0])
		.then((result) => {
			let statusId = status,
				opts = Object.create(options);

			if(!isNumber(status)) {
				let transition = result.transitions.find((state) => {
					return state.name.toLowerCase() === status.toLowerCase();
				});	
				statusId = transition.id;
				status = transition.name;
			} else {
				let transition = result.transitions.find((state) => {
					return state.id === status;
				});	
				status = transition.name;
			}

			opts.url = config.jira.url + 'rest/api/2/issue/'+issue[0]+'/transitions?expand=transitions.fields';
			opts.json = {"transition": { "id": statusId }};
		
			return postRequest(opts);
		})
		.then((result) => {
			let message = {
          		"response_type": "ephemeral",
          		"text": "Issue *<" + config.jira.url + 'browse/' + issue + '|' + issue + '>* has been updated to `'+status+'`',
        	};
			return JSON.stringify(message);
		})
		.catch((err) => {
			let message = {text: err.toString()};
			if (issue[0] === '') {
				message.text = 'No issue detected in your command. Please type `'+command+' help` for assistance.';
			} else if (status === '') {
				message.text = 'No transition name or ID detected in your command. Please type `'+command+' help` for assistance.';
			} else if (err === '404') {
				message.text = 'Issue `'+issue+'` does not exist. Please type `'+command+' help` for assistance.';	
			} else if (err === 'not' || err instanceof TypeError) {
				message.text = 'That is not a valid transition state or name. Type `'+command+' s '+issue+'` to see the valid states for this issue.';	
			}

			console.log(err);
			return JSON.stringify(message);
		});
}

module.exports.queryIssues = (query) => {
	let opts = Object.create(options);

	if (query.toLowerCase() === 'unassigned') {
		opts.url = encodeURI(config.jira.url + 'rest/api/2/search?jql=assignee in (EMPTY)');
	} else {
		opts.url = encodeURI(config.jira.url + 'rest/api/2/search?jql=assignee in ('+query+')');	
	}

	return getRequest(opts)
		.then((result) => {
			let message = {
	          "response_type": "ephemeral",
	          "text": "Issues assigned to: *" + query + "*",
	          'attachments': []
	        };

	        if (query === '') {
	        	message.text = 'No user string found in command. Type `'+command+' help` to get details on how to use this command.'
	        } else {
	        	message.attachments = result.issues.map(function(issue) {
			        return {
			          'fallback': 'Task ' + issue.key + ' ' + issue.fields.summary + ': ' + config.jira.url + 'browse/' + issue.key,
			          'pretext': '*Task <' + config.jira.url + 'browse/' + issue.key + '|' + issue.key + '>*',
			          'text': issue.fields.summary,
			          'color': '#974A50',
			          'mrkdwn_in': ['text','pretext']	
			        }
	      		});

		      	if (message.attachments.length === 0) {
			        message.text += '\nNo issues found';
		      	}
	        }

	      	return JSON.stringify(message);
		})
		.catch((err) => {
			let message = {text: 'User ' + query + ' was not found'};
			console.log(err);
			return JSON.stringify(message);
		});
}

module.exports.addComment = (args) => {
	let issue = "",
		comment = "",
		opts = Object.create(options);

	if (args.indexOf(' ') !== -1) {
        issue = args.substr(0, args.indexOf(' '));
        comment = '';
    }
	
	opts.url = config.jira.url + 'rest/api/2/issue/'+issue+'/comment';
	opts.json = {"body": comment};

	return postRequest(opts)
		.then((result) => {
			let message = {
          		"response_type": "ephemeral",
          		"text": "Your comment has been added to issue *<" + config.jira.url + 'browse/' + issue + '|' + issue + '>*',
        	};

			return JSON.stringify(message);
		})
		.catch((err) => {
			let message = {text: err.toString()};

			if (comment === '') {
				message.text = 'There was no comment attached to the command. Please try again.';
			}

			console.log(err);
			return JSON.stringify(message);
		});
}

module.exports.signinLink = (request) => {
	let slackState = new SlackState(),
		message = {
	      	"response_type": "ephemeral",
	      	"text": "Follow this link to connect your JIRA and Slack Accounts",
	      	'attachments': []
    	};
		
	return slackState.save()
		.then((result) => {
			console.log(result);
			let titleLink = 'https://slack.com/oauth/authorize?scope=identity.basic,identity.team,identity.email&client_id='.config.jira.url.'&state='.result.code;
			message.attachments = [{
        		"title": "Connect your accounts",
        		"title_link": titleLink
			}];
			return message;
		})
		.catch((error) => {
			message.text = 'Your connection link could not be created. Please try again or contact the administrator';
			return message;
		});
}

module.exports.help = (isIntentional) => {
	let message = {
      	"response_type": "ephemeral",
      	"text": '`'+command + " help` topics.",
      	'attachments': []
    };

    if(!isIntentional) {
    	message.text = 'That command does not exist. Here are the ' + command + ' help topics.';	
    }

    message.attachments = [{
    	'fallback': 'Viewing issues assigned to user.' + '`'+ command + ' i [name]`',
        'pretext': '*Viewing issues assigned to user:* `' + command + ' i [name]`',
        'text': 'Displays all the issues assigned to the user inside `[name]`. You may search by JIRA username or their real name, if it is set inside JIRA. \"Fuzzy\" matching does not work. Fully qualified names must be used. To search for unassigned issues, use the string `unassigned` in the `[name]` field.\n*Ex:* `'+ command + ' i Barry Allen`',
        'color': '#974A50',
        'mrkdwn_in': ['text','pretext']	
    },
	{
    	'fallback': 'Viewing details of an issue.' + '`'+ command + ' d [issueIDorKey]`',
        'pretext': '*Viewing details of an issue:* `' + command + ' d [issueIDorKey]`',
        'text': 'Displays title, summary, assignee, reporter, type, status and last update for the value given inside `[issueIDorKey]`.\n*Ex:* `'+command+' d COMM-4`',
        'color': '#617C51',
        'mrkdwn_in': ['text','pretext']		
    },
    {
    	'fallback': 'Viewing valid transition states for an issue.' + '`'+ command + ' s [issueIDorKey]`',
        'pretext': '*Viewing valid transition states for an issue:* `' + command + ' s [issueIDorKey]`',
        'text': 'Displays the ID and name for the transitional states available for `[issueIDorKey]`\n*Ex:* `'+command+' s COMM-4`',
        'color': '#D6B25E',
        'mrkdwn_in': ['text','pretext']		
    },
    {
    	'fallback': 'Update status of an issue.' + '`'+ command + ' t [issueIdOrKey] [statusNameOrId]`',
        'pretext': '*Update status of an issue:* `' + command + ' t [issueIdOrKey] [statusNameOrId]`',
        'text': 'Changes the status of issue. Both `[issueIdOrKey]` AND `[statusNameOrId]` must be present. To see valid states for an issue, see `'+command+' s [issueIDorKey]`\n*Ex:* `'+command+' t COMM-4 In Progress`',
        'color': '#e02e45',
        'mrkdwn_in': ['text','pretext']		
    }];

    return message;
}