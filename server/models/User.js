'use strict'
const config = require('../config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const UserSchema = new Schema({
        email: { 
            type: String
        },
    	jiraUserName: {
    		type: String,
    	},
    	jiraOAuthToken: {
    		type: String
    	},
        jiraOAuthSecret: {
    		type: String
    	},
    	slackUserName: {
    		type: String,
    	},
        slackTeamName: {
            type: String,
        },
        accessToken: {
            type: String,  
            unique: true  
        },
        userId: {
            type: String,
            unique: true
        },
        teamId: {
            type: String,
            unique: true    
        }
    });

UserSchema.pre('save', (next) => {
	let user = this;
    let cipher;

	if (user.jiraOAuthToken || user.jiraOAuthSecret) {

        if(user.jiraOAuthToken) {
            cipher = crypto.createCipher('aes-256-ctr', config.cryptoSecret)
            user.jiraOAuthToken = cipher.update(user.jiraOAuthToken,'utf8','hex');
        }

        if(user.jiraOAuthSecret) {
            cipher = crypto.createCipher('aes-256-ctr', config.cryptoSecret)
            user.jiraOAuthSecret = cipher.update(user.jiraOAuthSecret,'utf8','hex');
        }
    }

    next();
});

UserSchema.methods.decryptTokens = () => {
    let user = this;
    let decipher;

    if(user.jiraOAuthSecret) {
        decipher = crypto.createDecipher('aes-256-ctr', config.cryptoSecret);
        user.jiraOAuthSecret = decipher.update(user.jiraOAuthSecret, 'hex', 'utf8');
        user.jiraOAuthSecret += decipher.final('utf8');
    }

    if(user.jiraOAuthToken) {
        decipher = crypto.createDecipher('aes-256-ctr', config.cryptoSecret);
        user.jiraOAuthToken = decipher.update(user.jiraOAuthToken,'hex','utf8');
        user.jiraOAuthToken += decipher.final('utf8');
    }


};

module.exports = mongoose.model('User', UserSchema);