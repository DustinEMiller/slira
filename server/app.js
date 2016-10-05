
'use strict';

const Hapi = require('hapi'),
	Path = require('path'),
	config = require('./config'),
	server = new Hapi.Server({
		connections: {
	        routes: {
	            files: {
	                relativeTo: Path.join(__dirname, '../client')
	            }
	        }
    	}	
	}),
	mongoose = require('mongoose'),
    fs = require('fs');

server.connection({
	port: config.port,
		routes: {
		cors: true
	}
});

server.register([require('hapi-auth-jwt'), require('hapi-auth-cookie'), require('vision'),require('inert'), require('bell')],(err) => {
    
    let privateKey = fs.readFileSync('/etc/ssl/certs/slira-key.pem', 'utf8');

    server.auth.strategy('session', 'cookie', {
        password: 'secret_cookie_encryption_password',
        redirectTo: '/login/slack', 
        isSecure: false 
    });

  	server.auth.strategy('slack', 'bell', {
        provider: 'slack',
        password: 'dlksjdgjinrimirmnginhcoihgirhjgijcobpsdkgowkr',
        clientId: config.slack.clientId,
        clientSecret: config.slack.oauthSecret,
        scope: ['identify'],
        isSecure: false     // Terrible idea but required if not using HTTPS especially if developing locally
    });

    server.auth.strategy('custom', 'bell', {
        provider: {
            protocol: 'oauth',
            signatureMethod: 'RSA-SHA1',
            temporary: 'https://jira.healthalliance.org/plugins/servlet/oauth/request-token',
            auth: 'https://jira.healthalliance.org/plugins/servlet/oauth/authorize',
            token: 'https://jira.healthalliance.org/plugins/servlet/oauth/access-token',
            profile: function (credentials, params, get, callback) {
                console.log(credentials);
                get('https://jira.healthalliance.org', {}, (profile) => {

                    credentials.profile = {
                        username: profile.response.user.name,
                        raw: profile.response.user
                    };
                    return callback();
                });
            }
        },
        password: 'dlksjdgjinrimirmnginhcoihgirhjgijcobpsdkgowkr',
        clientId: 'slira',
        clientSecret: privateKey,
        isSecure: false     // Terrible idea but required if not using HTTPS especially if developing locally
    });
    
	server.route(require('./routes'));

	server.start((err) => {
		if (err) {
    		throw err;
  		}
  		mongoose.Promise = global.Promise;
  		mongoose.connect(config.mongo.url, {}, (err) => {
    		if (err) {
      			throw err;
    		}
  		});

		console.log('Server running on port:', config.port);
	});
});