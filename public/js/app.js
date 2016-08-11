(function() {

    angular.module('slira', ['ngRoute', 'templates-dist']);

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
        .when('/account', {
            templateUrl: '../client/js/account/account.view.html',
            controller: 'accountCtrl',
        })
        .otherwise({redirectTo: '/'});

    // use the HTML5 History API
    $locationProvider.html5Mode(true);
}

function run($rootScope, $location, $templateCache, authentication) {
    $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
        if ($location.path() === '/account' && !authentication.isLoggedIn()) {
            $location.path('/');
        }
    });
}

angular
.module('slira')
.config(['$routeProvider', '$locationProvider', config])
.run(['$rootScope', '$location', 'authentication', run]);

})();;(function() {
  
  angular
    .module('slira')
    .controller('accountCtrl', accountCtrl);

    accountCtrl.$inject = ['$location', 'sliraData'];
    function accountCtrl($location, sliraData) {
        var sl = this;

        sl.user = {};

    sliraData.getProfile()
        .success(function(data) {
            sl.user = data;
        })
        .error(function (e) {
            console.log(e);
        });
    }
})();;(function () {

  angular
  .module('slira')
  .controller('loginCtrl', loginCtrl);

    loginCtrl.$inject = ['$location', 'authentication'];

    function loginCtrl($location, authentication) {

        var sl = this;

        sl.credentials = {
            email : "",
            password : ""
        };

        sl.onSubmit = function () {
            authentication
            .login(sl.credentials)
            .then(function(){
                $location.path('account');
            })
            .catch(function(err){
                alert(err);
            });
        };
    }
})();;(function () {

  angular
    .module('slira')
    .controller('registerCtrl', registerCtrl);

  registerCtrl.$inject = ['$location', 'authentication', '$routeParams', '$scope'];
    function registerCtrl($location, authentication, $routeParams, $scope) {
        $scope.invalidToken = false;
        $scope.message = "";

        $scope.credentials = {
            email : "",
            password : "",
        };

        authentication.registrationToken($routeParams.registrationToken)
            .then(function(data){

                switch(data.status) {
                    case 'notFound':
                        $scope.invalidToken = true;
                        $scope.message = "The supplied registration token does not exist.";
                        break;
                    case 'expired':
                        $scope.invalidToken = true;
                        $scope.message = "The supplied registration token has expired.";
                        break;
                    case 'spent':
                        $scope.invalidToken = true;
                        $scope.message = "The supplied registration token has already been used.";
                        break;
                    case 'good':
                        console.log(data);
                        $scope.credentials.email = data.email;
                        break;
                }
            })
            .catch(function(err){
                $scope.invalidToken = true;
                $scope.message = "Internal error. Please try again";
            })

        sl.onSubmit = function () {
            console.log('Submitting registration');
            authentication
                .register(sl.credentials)
                .then(function(){
                    $location.path('account');
                })
                .catch(function(err){
                    alert(err);
                })
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
                    email : payload.email,
                    name : payload.name
                };
            }
        };

       var registrationToken = function (registrationToken) {
            return $http.post('/api/user/registrationRequest', {token: registrationToken})
                .then(function (request) {
                    return {status: request.data.status, email: request.data.email, slackUserName: request.data.slackUserName};
                })
                .catch(function (data) {
                    return {status: data.status};
                });
        };

        var register = function(user) {
            return $http.post('/api/user/create', user).then(function (data) {
                saveToken(data.token);
            });
        };

        var login = function(user) {
            return $http.post('/api/user/authenticate', user).then(function (data) {
                saveToken(data.token);
            });
        };

        var logout = function() {
            $window.localStorage.removeItem('slira-token');
        };

        return {
            currentUser: currentUser,
            saveToken: saveToken,
            getToken: getToken,
            isLoggedIn: isLoggedIn,
            register: register,
            registrationToken: registrationToken,
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
	  	return $http.get('/api/user/information', {
			headers: {
		  		Authorization: 'Bearer '+ authentication.getToken()
			}
	  	});
	};

	return {
	  	getProfile : getProfile
	};
  }

})();;(function($templateCache) {
  
  angular
    .module('slira')
    .controller('indexCtrl', indexCtrl);

    function indexCtrl () {
    }

})();;angular.module('templates-dist', ['../client/js/account/account.view.html', '../client/js/auth/login/login.view.html', '../client/js/auth/register/register.view.html', '../client/js/index/index.view.html']);

angular.module("../client/js/account/account.view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../client/js/account/account.view.html",
    "<navigation></navigation>\n" +
    "\n" +
    "<div class=\"container\">\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-md-6\">\n" +
    "            <h1 class=\"form-signin-heading\">Your profile</h1>\n" +
    "            <form  class=\"form-horizontal\">\n" +
    "                <div class=\"form-group\">\n" +
    "                    <label class=\"col-sm-3 control-label\">Full name</label>\n" +
    "                    <p class=\"form-control-static\">{{ vm.user.name }}</p>\n" +
    "                </div>\n" +
    "                <div class=\"form-group\">\n" +
    "                    <label class=\"col-sm-3 control-label\">Email</label>\n" +
    "                    <p class=\"form-control-static\">{{ vm.user.email }}</p>\n" +
    "                </div>\n" +
    "            </form>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("../client/js/auth/login/login.view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../client/js/auth/login/login.view.html",
    "<navigation></navigation>\n" +
    "\n" +
    "<div class=\"container\">\n" +
    "\n" +
    "  <div class=\"row\">\n" +
    "\n" +
    "    <div class=\"col-md-6\">\n" +
    "\n" +
    "      <h1 class=\"form-signin-heading\">Sign in</h1>\n" +
    "      <p class=\"lead\">Not a member? Please <a href=\"register\">register</a> instead.</p>\n" +
    "\n" +
    "        <form ng-submit=\"sl.onSubmit()\">\n" +
    "            <div class=\"form-group\">\n" +
    "                <label for=\"email\">Email address</label>\n" +
    "                <input type=\"email\" class=\"form-control\" id=\"email\" placeholder=\"Enter email\" ng-model=\"sl.credentials.email\">\n" +
    "            </div>\n" +
    "            <div class=\"form-group\">\n" +
    "                <label for=\"password\">Password</label>\n" +
    "                <input type=\"password\" class=\"form-control\" id=\"password\" placeholder=\"Password\" ng-model=\"sl.credentials.password\">\n" +
    "            </div>\n" +
    "            <button type=\"submit\" class=\"btn btn-default\">Sign in!</button>\n" +
    "        </form>\n" +
    "\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "</div>");
}]);

angular.module("../client/js/auth/register/register.view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../client/js/auth/register/register.view.html",
    "<navigation></navigation>\n" +
    "\n" +
    "<div class=\"container\">\n" +
    "<div class=\"row\">\n" +
    "    <div class=\"col-md-6\">\n" +
    "        <h1>Register</h1>\n" +
    "        {{message}}\n" +
    "        <p class=\"lead\">If you already have an account, please <a href=\"login\">log in</a> instead.</p>\n" +
    "        <form ng-submit=\"sl.onSubmit()\">\n" +
    "            <div class=\"form-group\">\n" +
    "                <label for=\"email\">Email address</label>\n" +
    "                <input type=\"email\" class=\"form-control\" id=\"email\" placeholder=\"Enter email\" ng-model=\"credentials.email\" ng-disabled=\"invalidToken\">\n" +
    "            </div>\n" +
    "            <div class=\"form-group\">\n" +
    "                <label for=\"password\">Password</label>\n" +
    "                <input type=\"password\" class=\"form-control\" id=\"password\" placeholder=\"Password\" ng-model=\"credentials.password\" ng-disabled=\"invalidToken\">\n" +
    "            </div>\n" +
    "            <button type=\"submit\" class=\"btn btn-default\">Register</button>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "</div>\n" +
    "</div>");
}]);

angular.module("../client/js/index/index.view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../client/js/index/index.view.html",
    "<navigation></navigation>\n" +
    "<div class=\"container\">\n" +
    "	<h1>Greetings</h1>\n" +
    "	<p>Please <a href=\"login\">sign in</a> or <a href=\"register\">register</a></p>\n" +
    "</div>");
}]);
