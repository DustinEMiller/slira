'use strict';
const Boom = require('boom'),
    config = require('../config'),
    Slack = require('../utils/slack'),
    JIRA = require('../utils/jira'),
    slack = new Slack({
        token: config.slack.token
    });

function slackTokenMatch(token) {
    const tokens = config.slack.webhooks.requestTokens,
    match = tokens.filter((t) => t === token);

    return match.length > 0;
}

module.exports.slackHook = function(request, reply) {
    const payload = request.payload;
    let command = payload.text.split(/\s+/).slice(0,1),
        argString = payload.text.replace(command[0], '').trim(),
        mechanism;

    JIRA.setCommand(payload.command);

    if (!slackTokenMatch(payload.token)) {
        let message = {
            "response_type": "ephemeral",
            "text": "There was an issue with the request token. Please notify the administrator."
        };
        return reply(message).header('content-type', 'application/json');
    }

    if (command[0] === 'issues' || command[0] === 'i') {
        mechanism = JIRA.queryIssues(argString);
        console.log(mechanism);
    } else if (command[0] === 'states' || command[0] === 's') {
        mechanism = JIRA.retrieveTransitions(argString);
    } else if (command[0] === 'details' || command[0] === 'd') {
        mechanism = JIRA.issueDetails(argString); 
    } else if (command[0] === 'transition' || command[0] === 't') {
        mechanism = JIRA.transitionIssue(argString);
    } else if (command[0] === 'comment' || command[0] === 'c') {
        mechanism = JIRA.addComment(argString);
    } else if (command[0] === 'connect') {
        mechanism = JIRA.signinLink(request.payload);
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

module.exports.checkUser = function(request, reply) {
    console.log(JIRA.checkUser(request.auth.credentials.id))

    JIRA.checkUser(request.auth.credentials.id)
        .then((result) => {
            reply(result); 
        })
        .catch((error) => {
            reply(error);
        });
};

module.exports.updateUser = function(request, reply) {
    console.log(request);
    /*JIRA.updateUser(request.auth.credentials.id)
        .then((result) => {
            reply(result); 
        })
        .catch((error) => {
            reply(error);
        });*/
};

module.exports.issueUpdatedHook = function(request, reply) {
    if (request.payload.hasOwnProperty("comment")) {
    	//console.log(request.payload.comment);
    	console.log(request.payload.issue);
    	//request.payload.issue.assignee
    	//request.payload.issue.reporter
    	//request.payload.issue.watches.self (api call url);
    }
};