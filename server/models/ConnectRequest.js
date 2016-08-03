'use strict'

let mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto'),
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
		
	crypto.randomBytes(48, function(err, buffer) {
		console.log(err);
  		this.connect_token = buffer.toString('hex');
	});
	next();		
});

module.exports = mongoose.model('ConnectRequest', ConnectRequestSchema);