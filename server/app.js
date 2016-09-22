
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
	mongoose = require('mongoose');

server.connection({
	port: config.port,
		routes: {
		cors: true
	}
});

server.register([require('hapi-auth-jwt'), require('hapi-auth-cookie'), require('vision'),require('inert'), require('bell')],(err) => {
    server.auth.strategy('session', 'cookie', {
        password: 'secret_cookie_encryption_password',
        redirectTo: '/login/slack', 
        isSecure: false 
    });

	server.auth.strategy('jwt', 'jwt', {
    	key: config.jwtSecret,
    	verifyOptions: { algorithms: ['HS256'] }
  	});

  	server.auth.strategy('slack', 'bell', {
        provider: 'slack',
        password: 'dlksjdgjinrimirmnginhcoihgirhjgijcobpsdkgowkr',
        clientId: config.slack.clientId,
        clientSecret: config.slack.oauthSecret,
        scope: ['identify', 'identity.email'],
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