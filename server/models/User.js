'use strict'

let mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	bcrypt = require('bcryptjs'),
    UserSchema = new Schema({
        email: { 
            type: String
        },
    	jiraUserName: {
    		type: String,
    	},
    	jiraPassword: {
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

UserSchema.pre('update', function(next) {
	let user = this;
	if (user.jiraPassword && user.isModified('jiraPassword')) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
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