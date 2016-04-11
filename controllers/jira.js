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
    var message = {
          "response_type": "ephemeral",
          "text": "There was an issue with request token. Please notify the administrator."
        };
    return reply(message);
  }

  if (command[0] === 'issues' || command[0] === 'i') {
    JIRA.queryIssues(argString)
      .then((result) => {
        reply(result);
      })
      .catch((err) => {
        reply(err);
      });
  } else if (command[0] === 'states' || command[0] === 's') {
    
    JIRA.retrieveTransitions(argString)
      .then((result) => {
        reply(result);
      }) 
      .catch((err) => {
        reply(err);
      });
  } else if (command[0] === 'details' || command[0] === 'd') {
    JIRA.issueDetails(argString)
      .then((result) => {
        reply(result);
      })
      .catch((err) => {
        reply(err);  
      });  
  } else if (command[0] === 'transition' || command[0] === 't') {
    JIRA.transitionIssue(argString)
      .then((result) => {
        reply(result);
      })
      .catch((err) => {
        reply(err);
      });
  } else if (commandArgs[0] === 'help') {
    JIRA.help();
  } else {
    JIRA.help();
  }
};