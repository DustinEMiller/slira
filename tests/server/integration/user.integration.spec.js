(function() {
    "use strict";

    const expect = require("chai").expect;
    const chai = require('chai');
    const chaiHttp = require('chai-http');
    const app = require('../../../server/app.js');

    chai.use(chaiHttp);

    describe('JIRA connection valid', function() {
        it('Should test for a connection between client account and JIRA', function(done) {

            chai.request(app.listener)
                .get('/api/jira/valid')
                .end(function(err, response) {
                    console.log(err);
                    expect(err).not.to.exist();
                    expect(results.statusCode).to.equals(200);
                    done();
                });
        });
    });

})();