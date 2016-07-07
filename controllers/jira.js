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
      argString = request.payload.text.replace(command[0], '').trim(),
      mechanism;
      console.log(argString);
  JIRA.command = payload.command;

  if (!slackTokenMatch(payload.token)) {
    var message = {
          "response_type": "ephemeral",
          "text": "There was an issue with request token. Please notify the administrator."
        };
    return reply(message).header('content-type', 'application/json');
  }

  if (command[0] === 'issues' || command[0] === 'i') {
    mechanism = JIRA.queryIssues(argString);
  } else if (command[0] === 'states' || command[0] === 's') {
    mechanism = JIRA.retrieveTransitions(argString);
  } else if (command[0] === 'details' || command[0] === 'd') {
    mechanism = JIRA.issueDetails(argString); 
  } else if (command[0] === 'transition' || command[0] === 't') {
    mechanism = JIRA.transitionIssue(argString);
  } else if (command[0] === 'comment' || command[0] === 'c') {
    mechanism = JIRA.addComment(argString);
  } else if (command[0] === 'help') {
    return reply(JIRA.help(1)).header('content-type', 'application/json');
  } else {
    return reply(JIRA.help(0)).header('content-type', 'application/json');
  }

  mechanism
    .then((result) => {
      reply(result).header('content-type', 'application/json');
    })
    .catch((err) => {
      reply(err).header('content-type', 'application/json');
    });
};