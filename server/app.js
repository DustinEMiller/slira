const app = (() => {
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

    const preResponse = (request, reply) => {

        const response = request.response;

        if (!response.isBoom) {
            return reply.continue();
        }

        const error = response;

        if (error.output.statusCode === 404) {
            return reply.redirect('/notFound');
        } else if (error.output.statusCode === 500) {
            return reply.redirect('/');
        }

    };

    server.connection({
        port: config.port,
        routes: {
            cors: true
        }
    });


    server.register([require('hapi-auth-jwt'), require('hapi-auth-cookie'), require('inert'), require('bell')], (err) => {

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

    return server
});

module.exports = app();