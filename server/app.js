
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

const preResponse = function (request, reply) {

    const response = request.response;
    
    if (!response.isBoom) {
        return reply.continue();
    }

    const error = response;
  
    if(error.output.statusCode === 404) {
        return reply.redirect('/notFound');    
    } else if (error.output.statusCode === 500) {
        console.log(request.auth.error);
        if(!request.auth.error) {
            console.log('1');
            return reply.redirect('/');      
        } else {
            console.log('2');
            return reply.redirect('/error');      
        }
    }

};

server.connection({
	port: config.port,
		routes: {
		cors: true
	}
});

server.ext('onPreResponse', preResponse);

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
            temporary: config.jira.url + 'plugins/servlet/oauth/request-token',
            auth: config.jira.url + 'plugins/servlet/oauth/authorize',
            token: config.jira.url + 'plugins/servlet/oauth/access-token',
            profile: function (credentials, params, get, callback) {
                get(config.jira.url + 'rest/api/2/myself', {}, (profile) => {

                    credentials.profile = {
                        username: profile.name,
                        token: credentials.token,
                        secret: credentials.secret
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