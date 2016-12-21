let Consumer = (() => {
    "use strict";

    const config = require('../config');
    const fs = require('fs');
    const OAuth = require('oauth').OAuth;
    const privateKey = fs.readFileSync(config.privateKeyFile, 'utf8');
    let consumer =
        new OAuth(config.jira.url + "plugins/servlet/oauth/request-token", config.jira.url + "plugins/servlet/oauth/access-token",
            "hardcoded-consumer", privateKey, "1.0", config.url + "/login/jira", "RSA-SHA1");
    //let consumer = new OAuth(null, null, "hardcoded-consumer", privateKey, "1.0", null, "RSA-SHA1");

    return consumer;
})();

module.exports = Consumer;