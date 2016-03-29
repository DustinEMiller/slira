'use strict';

const Hapi = require('hapi');
const config = require('./config');
const server = new Hapi.Server();

server.connection({
  port: config.port,
  routes: {
    cors: true
  }
});

console.log('nuts');
server.register(require('hapi-auth-basic'),() => {
	console.log('nuts');
  server.route(require('./routes'));

  server.start(() => {
    console.log('Server running at:', server.info.uri);
  });
});