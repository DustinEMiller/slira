'use strict'

let mongoose = require('mongoose'),
	Schema = mongoose.Schema,
    crypto = require('crypto'),
    SlackStateSchema = new Schema({
    	created_at: {
    		type: Date
    	},
    	delete_at: {
    		type: Date
    	},
    	used: {
    		type: Boolean,
    		required: true,
    		default: false
    	},
    	state: {
    		type: String
    	}
    });

SlackStateSchema.pre('save', function(next) {
    let slackState = this;
	slackState.created_at = new Date();
	slackState.delete_at = new Date(slackState.created_at);
	slackState.delete_at.setTime(slackState.created_at.getTime() + 1440*60000);

    crypto.randomBytes(48, function(err, buffer) {
        if(err) {
            return next(err);
        }

        slackState.state = buffer.toString('hex');
        next();
    });
});

module.exports = mongoose.model('SlackState', SlackStateSchema);