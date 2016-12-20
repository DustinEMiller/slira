'use strict';
const Boom = require('boom');
const config = require('../config');
const Slack = require('../utils/slack');
const JIRA = require('../utils/jira');

let options = {
    headers: {
        'X-Atlassian-Token': 'no-check',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + new Buffer(config.jira.username + ":" + config.jira.password).toString('base64')
    },
};

function slackTokenMatch(token) {
    const tokens = config.slack.webhooks.requestTokens,
    match = tokens.filter((t) => t === token);

    return match.length > 0;
}

module.exports.slackHook = (request, reply) => {
    const payload = request.payload;
    let mechanism;

    if (!slackTokenMatch(payload.token)) {
        let message = {
            "response_type": "ephemeral",
            "text": "There was an issue with the request token. Please notify the administrator."
        };
        return reply(message).header('content-type', 'application/json');
    }

    JIRA.setCommand(payload.command);

    mechanism = JIRA.doAction(payload);

    if(typeof mechanism.then === 'function') {
        mechanism
            .then((result) => {
                reply(result).header('content-type', 'application/json');
            })
            .catch((err) => {
                reply(err).header('content-type', 'application/json');
            });
    } else {
        return reply(mechanism).header('content-type', 'application/json');
    }

};

module.exports.checkUser = (request, reply) => {
    JIRA.checkUser(request.auth.credentials.id)
        .then((result) => {
            reply(result);
        })
        .catch((error) => {
            reply(error);
        });
};

module.exports.issueUpdatedHook = (request, reply) => {
    // change status console.log(request.payload.changelog.items);
    console.log(request.payload);

    //get all watchers first, ignore reporters

    if (request.payload.hasOwnProperty("comment")) {
        console.log(request.payload.comment);
    	//console.log(request.payload.comment);
    	//console.log(request.payload.issue);
    	//request.payload.issue.assignee
    	//request.payload.issue.fields.reporter
    	//request.payload.issue.watches.fields.self (api call url);
    } else if (request.payload.hasOwnProperty("changelog")) {
        //status, assignee
    }
};