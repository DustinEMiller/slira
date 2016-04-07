'use strict';
const Boom = require('boom');

const config = require('../config');
const Slack = require('../utils/slack');
const JIRA = require('../utils/jira');

const slack = new Slack({
  token: config.slack.token
});

function slackTokenMatch(token) {
  const tokens = config.slack.webhooks.requestTokens;
  const match = tokens.filter((t) => t === token);

  return match.length > 0;
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

module.exports.slackHook = function(request, reply) {
  const payload = request.payload;
  var command = request.payload.text.split(/\s+/).slice(0,1),
      argString = request.payload.text.replace(command[0], '').trim();

  if (!slackTokenMatch(payload.token)) {
    return reply(Boom.badRequest('Bad Request Token'));
  }

  if (command[0] === 'issues') {
    JIRA.queryIssues(argString)
    .then((result) => {

      var message = {
          "response_type": "ephemeral",
          "text": "Issues assigned to: *" + argString + "*",
          'attachments': []
        };

      message.attachments = result.issues.map(function(issue){
        return {
          'fallback': 'Task ' + issue.key + ' ' + issue.fields.summary + ' ' + issue.fields.description + ': ' + config.jira.url + '/browse/' + issue.key,
          'pretext': 'Task <' + config.jira.url + '/browse/' + issue.key + '|' + issues.key + '>',
          'title': issue.fields.summary,
          'text': issue.fields.description,
          'color': '#F35A00'
        }
      });

      if (message.attachments.length === 0) {
        message.text += '\nNo issues found';
      }

      reply(JSON.stringify(message)).header('content-type', 'application/json');
    })
    .catch((err) => {
      reply(Boom.badImplementation(err));
    });
  } else if (command[0] === 'states') {
    
    JIRA.retrieveTransitions(argString)
      .then((result) => {
        var message = {
          "response_type": "ephemeral",
          "text": "Transition states available for the issue <" + config.jira.url + '/browse/' + argString + '|' + argString + '>',
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

        reply(JSON.stringify(message)).header('content-type', 'application/json');
      }) 
      .catch((err) => {
        reply(Boom.badImplementation(err));
      });
  } else if (command[0] === 'details') {
    JIRA.issueDetails(argString)
      .then((result) => {
        var message = {
          'response_type': 'ephemeral',
          'attachments' : [{
            'pretext': 'Task <' + config.jira.url + '/browse/' + argString + '|' + argString + '>',
            'title': result.fields.summary,
            'text': result.fields.description,
            'fields': [{
                'title': 'Assignee',
                'value': fields.assignee.displayName,
                'short': true
              },
              {
                'title': 'Reporter',
                'value': fields.reporter.displayName,
                'short': true
              },
              {
                'title': 'Type',
                'value': fields.issuetype.name,
                'short': true
              },
              {
                'title': 'Status',
                'value': fields.status.statusCategory.name,
                'short': true
              },
              {
                'title': 'Last Updated',
                'value': fields.updated,
                'short': true
              }
            ],
          'color': '#F35A00'
          }]
        };
      })
      .catch((err) => {
        reply(Boom.badImplementation(err));  
      });  
  } else if (command[0] === 'transition') {
    JIRA.transitionIssue(argString)
      .then((result) => {

      })
      .catch((err) => {
        
      });
  } else if (commandArgs[0] === 'help') {

  } else {

  }
};