let expect = require('chai').expect;
let User = require('../../../server/models/User');

describe('user', function() {
    "use strict";
    it('should be invalid if userID is empty', function(done) {
        let u = new User({userId:null});
        u.validate(function(err) {
            console.log(err);
        });

        //expect(error.errors.userId).to.exist;

    });
});