'use strict'

let mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto'),
    ConnectRequestSchema = new Schema({
    	email: { 
            type: String, 
            required: true, 
            index: { unique: true } 
        },
    	slackUserName: {
    		type: String,
    		required: true
    	},
    	created_at: {
    		type: Date,
    		required: true
    	},
    	expires: {
    		type: Date,
    		required: true
    	},
    	spent: {
    		type: Boolean,
    		required: true,
    		default: false
    	},
    	connect_token: {
    		type: String,
    		required: true
    	}
    });

ConnectRequestSchema.pre('save', function(next) {
	this.created_at = new Date();
	this.delete_at.setTime(this.created_at.getTime() + 30*60000); 
		
	crypto.randomBytes(48, function(err, buffer) {
  		this.connect_token = buffer.toString('hex');
	});
	next();		
});

module.exports = mongoose.model('User', ConnectRequestSchema);