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

server.register(require('hapi-auth-basic'),() => {
  server.route(require('./routes'));
  server.start(() => {
    console.log('Server running at:', server.info.uri);
  });
});