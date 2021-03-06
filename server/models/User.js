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
    	jiraUserName: {
    		type: String,
    		unique: true,
    	},
    	jiraPassword: {
    		type: String
    	},
    	slackUserName: {
    		type: String,
    		required: true
    	},
        accessToken: {
            type: String,    
        },
        userId: {
            type: String,    
        },
        teamId: {
            type: String,    
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