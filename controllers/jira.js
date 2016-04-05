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
          'fallback': 'Task ' + issue.key + ' ' +issue.fields.summary + ' ' + issue.fields.description,
          'pretext': 'Task ' + issue.key,
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
    JIRA.queryIssues(argString)
      .then((result) => {
        var message = {
          "response_type": "ephemeral",
          "text": "Transition stats available for the issue *" + argString + "*",
          'attachments': []
        };

        message.attachments = result.transitions.map(function(transition){
          return {
            'fallback': transition.name + ': ' + transition.to.description,
            'title': transition.name
            'text': transition.to.description,
            'color': transition.to.statusCategory.colorName
          }
        });

        if (message.attachments.length === 0) {
          message.text += '\nThat issue does not exist';
        }
      }) 
      .catch((err) => {

      });
  } else if (command[0] === 'details') {
    
  } else if (command[0] === 'transition') {
    JIRA.transitionIssue(commandArgs)
      .then((result) => {

      })
      .catch((err) => {
        
      });
  } else if (commandArgs[0] === 'help') {

  } else {

  }
};