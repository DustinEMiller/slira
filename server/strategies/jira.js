'use strict';

exports = module.exports = function (options) {

    return {
        protocol: 'oauth',
        signatureMethod: 'RSA-SHA1',
        temporary: 'https://jira.healthalliance.org/plugins/servlet/oauth/request-token',
        auth: 'https://jira.healthalliance.org/plugins/servlet/oauth/access-token',
        token: 'https://jira.healthalliance.org/plugins/servlet/oauth/authorize',
        profile: function (credentials, params, get, callback) {

            get('htps://jira.healthalliance.org', {}, (profile) => {

                credentials.profile = {
                    username: profile.response.user.name,
                    raw: profile.response.user
                };
                return callback();
            });
        }
    };
};