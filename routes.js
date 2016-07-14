'use strict';
const jira = require('./controllers/jira');


module.exports = [
  {
    path:'/webhooks/slack',
    method:'POST',
    handler: jira.slackHook,
  }
];

module.exports = [
  {
    path:'/webhooks/issueUpdated',
    method:'POST',
    handler: jira.issueUpdatedHook,
  }
];