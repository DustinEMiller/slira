'use strict'

let mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	bcrypt = require('bcryptjs'),
    UserSchema = new Schema({
        email: { 
            type: String, 
            required: true, 
            index: { unique: true } 
        },
        password: { 
            type: String, 
            required: true 
        },
    	jiraUserName: {
    		type: String,
    		unique: true,
    		required: true
    	},
    	jiraPassword: {
    		type: String,
    		required: true
    	},
    	slackUserName: {
    		type: String,
    		required: true
    	}
    });

UserSchema.pre('save', function(next) {
	let user = this;
	if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
            });
            bcrypt.hash(user.jiraPassword, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.jiraPassword = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);