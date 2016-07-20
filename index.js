
'use strict';

const Hapi = require('hapi'),
	config = require('./config'),
	server = new Hapi.Server();

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

  		mongoose.connect(dbUrl, {}, (err) => {
    		if (err) {
      			throw err;
    		}
  		});

		console.log('Server running at:', config.mongo.url);
	});
});