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
                .then(function(response) {
                    expect(response).to.have.status(200);
                    done();
                })
                .catch(function(err) {
                    throw err;
                });
        });
    });

})();