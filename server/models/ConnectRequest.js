'use strict'

let mongoose = require('mongoose'),
	Schema = mongoose.Schema,
    ConnectRequestSchema = new Schema({
    	email: { 
            type: String
        },
    	slackUserName: {
    		type: String,
    		required: true
    	},
    	created_at: {
    		type: Date
    	},
    	delete_at: {
    		type: Date
    	},
    	spent: {
    		type: Boolean,
    		required: true,
    		default: false
    	},
    	connect_token: {
    		type: String
    	}
    });

ConnectRequestSchema.pre('save', function(next) {
	this.created_at = new Date();
	this.delete_at = new Date(this.created_at);
	this.delete_at.setTime(this.created_at.getTime() + 30*60000);
});

module.exports = mongoose.model('ConnectRequest', ConnectRequestSchema);