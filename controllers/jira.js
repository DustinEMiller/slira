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

  if (!slackTokenMatch(payload.token)) {
    return reply(Boom.badRequest('Bad Request Token'));
  }
  console.log(JIRA.queryIssues());
  reply(JIRA.queryIssues());
  /*
  slack.getUserInfo(payload.user_id)
    .then((result) => {
      const profile = result.user.profile;

      return Employee.getByEmail(profile.email)
        .then((employee) => {

          if (!employee) {

            return new Employee({
              name: profile.realName,
              email: profile.email,
              status,
              command
            })
            .save();

          } else {

            return Employee.updateStatus(employee.email, status, command);
          }
        })
        .then((employee) => {
          var message = '',
              botResponse;
          if(employee.message){
            message = ' "'+employee.message+'"';
          }
          botResponse = '*' + employee.name + '*: ' + employee.status + message;
          req({
            url: 'https://hooks.slack.com/services/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',
            method: 'POST',
            json: {
              channel: "#where",
              username: "Where Bot",
              text: botResponse
            }
          }, function(err, res) {
            console.log(err, res);
          });
          reply('Updated status to *'+employee.status+'*, your default status is: *'+employee.defaultStatus+'*. \n To change your default status use \`/here -default` for *InOffice*, \`/out -default` for *OutOfOffice* and \`/remote -default` for *Remote* \nAttach a message to your status: \`/'+slashCommand+' -default This is my message!` or \`/'+slashCommand+' This is my message!`\nTo view statuses use \`/where \`. You may also use a *single* word as a search condition. \`/where jeff\``');
          logEvent(employee);
        });
    })
    .catch((err) => {
      console.log(err);
      reply(Boom.badImplementation());
    });
  */
};