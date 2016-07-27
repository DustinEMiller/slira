
'use strict';

const Hapi = require('hapi'),
	config = require('./config'),
	server = new Hapi.Server(),
	mongoose = require('mongoose');

server.connection({
	port: config.port,
		routes: {
		cors: true
	}
});

server.register(require('hapi-auth-jwt'),(err) => {
	server.auth.strategy('jwt', 'jwt', {
    	key: config.jwtSecret,
    	verifyOptions: { algorithms: ['HS256'] }
  	});


	server.route(require('./routes'));

	server.start((err) => {
		if (err) {
    		throw err;
  		}

  		mongoose.connect(config.mongo.url, {}, (err) => {
    		if (err) {
      			throw err;
    		}
  		});

		console.log('Server running on port:', config.port);
	});
});