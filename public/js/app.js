(function() {

    angular.module('slira', ['ngRoute', 'templates-dist', 'ngMessages']);

    function config ($routeProvider, $locationProvider) {
        $routeProvider
        .when('/', {
            templateUrl: '../client/js/index/index.view.html',
            controller: 'indexCtrl',
        })
        .when('/register/:registrationToken', {
           templateUrl: '../client/js/auth/register/register.view.html',
            controller: 'registerCtrl',
        })
        .when('/login', {
            templateUrl: '../client/js/auth/login/login.view.html',
            controller: 'loginCtrl',
        })
        .when('/slack', {
            templateUrl: '../client/js/auth/slack/slack.view.html',
            controller: 'slackCtrl',
        })
        .when('/account', {
            templateUrl: '../client/js/account/account.view.html',
            controller: 'accountCtrl',
        })
        .when('/loginError', {
            templateUrl: '../client/js/errors/loginError.view.html'
        })
        .when('/unauthorized', {
            templateUrl: '../client/js/errors/unauthorized.view.html'
        })
        .otherwise({redirectTo: '/'});

    // use the HTML5 History API
    $locationProvider.html5Mode(true);
}
//https://slack.com/oauth/authorize?scope=identity.basic,identity.team,identity.email&client_id=13949143637.72058318581
function run($rootScope, $location, $templateCache, authentication) {
    /*$rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
        if ($location.path() === '/account' && !authentication.isLoggedIn()) {
            $location.path('/');
        }
    });*/
}

angular
.module('slira')
.config(['$routeProvider', '$locationProvider', config])
.run(['$rootScope', '$location', '$templateCache', 'authentication', run]);

})();;(function() {
  
  angular
    .module('slira')
    .controller('accountCtrl', accountCtrl);

    accountCtrl.$inject = ['$location', 'sliraData', '$routeParams', '$scope'];

    function accountCtrl($location, sliraData, $routeParams, $scope) {
        $scope.user = {};

        sliraData.getProfile()
            .then(function(data) {
                console.log(data)
                $scope.user = data;
            })
            .catch(function (e) {
                console.log(e);
            });
    }
})();;(function () {

  angular
  .module('slira')
  .controller('loginCtrl', loginCtrl);

    loginCtrl.$inject = ['$scope'];

    function loginCtrl($scope) {

        $scope.slackLogin = function() {
          window.location = "/login/slack"    
        }
    }
})();;(function () {

  angular
    .module('slira')
    .controller('registerCtrl', registerCtrl);

  registerCtrl.$inject = ['$location', 'authentication', '$routeParams', '$scope'];
    function registerCtrl($location, authentication, $routeParams, $scope) {
        $scope.message = "";
        $scope.invalidToken = false;
        $scope.invalidRegistration = false;

        $scope.credentials = {
            email: "",
            password: "",
            token: $routeParams.registrationToken
        };

        authentication.registrationToken($routeParams.registrationToken)
            .then(function(response) {
                if(response.data.success) {
                    $scope.credentials.email = response.data.email;   
                } else {
                    $scope.registration.$error.formLevel = true;
                    $scope.invalidToken = true;
                    $scope.message = response.data.msg;    
                }
            })
            .catch(function(err) {
                $scope.registration.$error.formLevel = true;
                $scope.invalidToken = true;
                $scope.message = "Internal error. Please try again";
            })

        $scope.onSubmit = function(isValid) {
            if(isValid) {
                authentication
                .register($scope.credentials)
                .then(function(response) {
                    if(response.data.success) {
                        $location.path('account');
                    } else {
                        $scope.invalidRegistration = true;
                        $scope.registrationMessage = response.data.msg;
                    }
                    
                })
                .catch(function(err) {
                    if(err.data.message == 'child "password" fails because ["password" is not allowed to be empty]') {
                        $scope.registrationMessage = "Password must not be empty";
                    } else if (err.data.message == 'child "password" fails because ["password" length must be at least 6 characters long]') {
                        $scope.message = "Password must be at least 6 characters longs";    
                    } else if (err.data.registrationMessage == 'child "email" fails because ["email" is not allowed to be empty]') {
                        $scope.registrationMessage = "Email must not be empty";
                    } else {
                        $scope.registrationMessage = "There was an error. Please try again.";    
                    }
                });    
            }
        };
    }
})();;(function () {

  angular
    .module('slira')
    .controller('slackCtrl', slackCtrl);

  slackCtrl.$inject = ['$location', 'authentication', '$scope'];
    function slackCtrl($location, authentication, $scope) {
        console.log($location.search());

        $scope.onSubmit = function(isValid) {
            if(isValid) {
                authentication
                .register($scope.credentials)
                .then(function(response) {
                    if(response.data.success) {
                        $location.path('account');
                    } else {
                        $scope.invalidRegistration = true;
                        $scope.registrationMessage = response.data.msg;
                    }
                    
                })
                .catch(function(err) {
                    if(err.data.message == 'child "password" fails because ["password" is not allowed to be empty]') {
                        $scope.registrationMessage = "Password must not be empty";
                    } else if (err.data.message == 'child "password" fails because ["password" length must be at least 6 characters long]') {
                        $scope.message = "Password must be at least 6 characters longs";    
                    } else if (err.data.registrationMessage == 'child "email" fails because ["email" is not allowed to be empty]') {
                        $scope.registrationMessage = "Email must not be empty";
                    } else {
                        $scope.registrationMessage = "There was an error. Please try again.";    
                    }
                });    
            }
        };
    }
})();;(function () {

  angular
    .module('slira')
    .service('authentication', authentication);

  authentication.$inject = ['$http', '$window'];
    function authentication ($http, $window) {

        var saveToken = function (token) {
            $window.localStorage['slira-token'] = token;
        };

        var getToken = function () {
            return $window.localStorage['slira-token'];
        };

        var isLoggedIn = function() {
            var token = getToken();
            var payload;

            if(token){
                payload = token.split('.')[1];
                payload = $window.atob(payload);
                payload = JSON.parse(payload);

                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        };

        var currentUser = function() {
            if(isLoggedIn()){
                var token = getToken();
                var payload = token.split('.')[1];
                payload = $window.atob(payload);
                payload = JSON.parse(payload);
                return {
                    _id: payload.id,
                    email : payload.email,
                    exp : payload.expiration
                };
            }
        };

       var slackLogin = function () {
            return $http.get('/api/login/slack')
                .then(function (request) {
                    return request;
                })
                .catch(function (data) {
                    return data;
                });
        };

        var register = function(user) {
            return $http.post('/api/user/create', user).then(function(response) {
                if(response.data.success) {
                    saveToken(response.data.token);    
                }
                return response;
            });
        };

        var login = function(user) {
            return $http.post('/api/user/authenticate', user).then(function(response) {
                if(response.data.success) {
                    saveToken(response.data.token);    
                }
                return response;
            });
        };

        var logout = function() {
            $window.localStorage.removeItem('slira-token');
        };

        return {
            currentUser: currentUser,
            saveToken: saveToken,
            getToken: getToken,
            slackLogin: slackLogin,
            isLoggedIn: isLoggedIn,
            register: register,
            login: login,
            logout: logout
        };
    }


})();;(function() {

  angular
	.module('slira')
	.service('sliraData', sliraData);

  sliraData.$inject = ['$http', 'authentication'];

  function sliraData ($http, authentication) {

	var getProfile = function () {
	  	return $http.get('/api/user/information');
	};

	return {
	  	getProfile : getProfile
	};
  }

})();

/*return {
            // automatically attach Authorization header
            request: function(config) {
                var token = auth.getToken();

                if(config.url.indexOf(API) === 0 && token) {
                    config.headers.Authorization = 'Bearer ' + token;
                }

                return config;
            },

            // If a token was sent back, save it
            response: function(res) {
                if(res.config.url.indexOf(API) === 0 && res.data.token) {
                    auth.saveToken(res.data.token);
                }

                return res;
            },
        }*/;(function($templateCache) {
  
  angular
    .module('slira')
    .controller('indexCtrl', indexCtrl);

    function indexCtrl () {
    }

})();;angular.module('templates-dist', ['../client/js/account/account.view.html', '../client/js/auth/login/login.view.html', '../client/js/auth/register/register.view.html', '../client/js/auth/slack/slack.view.html', '../client/js/errors/loginError.view.html', '../client/js/errors/unauthorized.view.html', '../client/js/index/index.view.html']);

angular.module("../client/js/account/account.view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../client/js/account/account.view.html",
    "<navigation></navigation>\n" +
    "\n" +
    "<div class=\"row\">\n" +
    "    <div class=\"small-12 columns\">\n" +
    "        <h2>Your Account</h2>\n" +
    "        \n" +
    "        <div> \n" +
    "        <form id=\"general\">\n" +
    "            <fieldset class=\"fieldset\">\n" +
    "            <legend>Account Information</legend>\n" +
    "            <div class=\"row\">\n" +
    "                <div class=\"small-12 columns\">\n" +
    "                    <label for=\"email\">Email</label>\n" +
    "                    <input id=\"email\" name=\"email\" size=\"30\" type=\"text\" value=\"{{email}}\">\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"row\">\n" +
    "                <div class=\"small-12 columns\">\n" +
    "                    <label for=\"slack-user-name\">Slack User Name</label>\n" +
    "                    <input id=\"slack-user-name\" name=\"slack-user-name\" size=\"30\" type=\"text\" value=\"{{slackUserName}}\">\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            </fieldset>\n" +
    "        </form>\n" +
    "        </div>\n" +
    "\n" +
    "        <div> \n" +
    "        <form id=\"general\">\n" +
    "            <fieldset class=\"fieldset\">\n" +
    "            <legend>Update JIRA Username</legend>\n" +
    "            <div class=\"row\">\n" +
    "                 <div class=\"small-12 columns\">\n" +
    "                    <label for=\"jira-user-name\">JIRA Username</label>\n" +
    "                    <input id=\"jira-user-name\" name=\"jira-user-name\" size=\"30\" type=\"text\" value=\"{{jiraUserName}}\">\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <button class=\"button\" type=\"submit\">Update Username</button>\n" +
    "            </fieldset>\n" +
    "        </form>\n" +
    "        </div>\n" +
    "\n" +
    "        <div>\n" +
    "        <form id=\"jira-pw\">\n" +
    "            <fieldset class=\"fieldset\">\n" +
    "            <legend>Update JIRA Password</legend>\n" +
    "            <div class=\"row\">\n" +
    "                <div class=\"small-12 columns\">\n" +
    "                    <label for=\"old-jira-password\">Old JIRA Password</label>\n" +
    "                    <input id=\"old-jira-password\" name=\"old-jira-password\" size=\"30\" type=\"password\">\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"row\">\n" +
    "                <div class=\"small-12 columns\">\n" +
    "                    <label for=\"current-account-password\">Current JIRA Password</label>\n" +
    "                    <input id=\"current-account-password\" name=\"current-account-password\" size=\"30\" type=\"password\">\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <button class=\"button\" type=\"submit\">Update JIRA Password</button>\n" +
    "            </fieldset>\n" +
    "        </form>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("../client/js/auth/login/login.view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../client/js/auth/login/login.view.html",
    "<navigation></navigation>\n" +
    "\n" +
    "<div class=\"row\">\n" +
    "    <div class=\"small-12 columns\">\n" +
    "        <h1>Log In</h1>\n" +
    "        <a ng-click=\"slackLogin()\"><img src=\"https://api.slack.com/img/sign_in_with_slack.png\"/></a>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("../client/js/auth/register/register.view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../client/js/auth/register/register.view.html",
    "<navigation></navigation>\n" +
    "\n" +
    "<div class=\"row\">\n" +
    "    <div class=\"small-12 columns\">\n" +
    "        <h2>Register</h2>\n" +
    "        <p>If you already have an account, please <a href=\"login\">log in</a> instead.</p>\n" +
    "        <form name=\"registration\" ng-submit=\"onSubmit(registration.$valid)\" novalidate>\n" +
    "            <div class=\"row\" ng-show=\"invalidToken\">\n" +
    "                <div class=\"small-12 columns\">{{message}}</div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div>\n" +
    "                <label for=\"email\">Email address</label>\n" +
    "                <input type=\"email\" id=\"email\" placeholder=\"Enter email\" name='email' ng-model=\"credentials.email\" ng-disabled=\"invalidToken\" required>\n" +
    "                <div ng-messages=\"registration.email.$error\" ng-hide=\"invalidToken\">\n" +
    "                    <div ng-message=\"required\">Email is required.</div>\n" +
    "                    <div ng-message=\"email\">Your email address is invalid</div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div>\n" +
    "                <label for=\"password\">Password</label>\n" +
    "                <input type=\"password\" id=\"password\" placeholder=\"Password\" name=\"password\" ng-model=\"credentials.password\" ng-disabled=\"invalidToken\" ng-minlength=\"6\" required>\n" +
    "                <div ng-messages=\"registration.password.$error\" ng-hide=\"invalidToken\">\n" +
    "                    <div ng-message=\"required\">Password is required.</div>\n" +
    "                    <div ng-message=\"minlength\">Password must be at least 6 characters long.</div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <button type=\"submit\" ng-disabled=\"!registration.$valid || invalidToken\">Register</button>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("../client/js/auth/slack/slack.view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../client/js/auth/slack/slack.view.html",
    "<navigation></navigation>\n" +
    "\n" +
    "<div class=\"row\">\n" +
    "    <div class=\"small-12 columns\">\n" +
    "    Things are hapenning\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("../client/js/errors/loginError.view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../client/js/errors/loginError.view.html",
    "loginError");
}]);

angular.module("../client/js/errors/unauthorized.view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../client/js/errors/unauthorized.view.html",
    "You're not allowed");
}]);

angular.module("../client/js/index/index.view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../client/js/index/index.view.html",
    "<navigation></navigation>\n" +
    "<div>\n" +
    "	<h1>Greetings</h1>\n" +
    "	<p>Please <a href=\"login\">sign in</a></p>\n" +
    "</div>");
}]);
