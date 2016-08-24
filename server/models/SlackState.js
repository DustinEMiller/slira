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
	this.created_at = new Date();
	this.delete_at = new Date(this.created_at);
	this.delete_at.setTime(this.created_at.getTime() + 1440*60000);

    crypto.randomBytes(48, function(err, buffer) {
        if(err) {
            return next(err);
        }

        this.state = buffer.toString('hex');
        console.log(this.state);
        return next();
    });
});

module.exports = mongoose.model('SlackState', SlackStateSchema);