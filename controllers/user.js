'user strict'

const User = require('../model/sUser'),
	req = require(req);

function existingUser() {
	return new Promise((resolve, reject) => {
	    req(options, function(err, httpResponse, body) {
			return httpResponse.statusCode;
	    });
  	});	
}

module.exports.addNew = function(request, reply) {
	let user = new User(),
		userCheck;

	user.userName = request.payload.userName;
	user.password = request.payload.password;
	user.userName = request.payload.slackUserName;

	let options = {
		headers: {
			'X-Atlassian-Token': 'no-check',
			'Content-Type': 'application/json',
			'Authorization': 'Basic ' + new Buffer(user.userName + ":" + user.userName).toString('base64')
		},	
	}

	//See if valid credentials for JIRA
}
	}
