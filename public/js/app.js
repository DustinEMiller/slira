(function() {

    angular.module('slira', ['ngRoute']);

    function config ($routeProvider, $locationProvider) {
        $routeProvider
        .when('/', {
            templateUrl: 'index/index.view.html',
            controller: 'indexCtrl',
        })
        //.when('/register', {
           // templateUrl: '/auth/register/register.view.html',
            //controller: 'registerCtrl',
        //})
        .when('/login', {
            templateUrl: '/auth/login/login.view.html',
            controller: 'loginCtrl',
        })
        //.when('/account', {
            //templateUrl: '/account/account.view.html',
            //controller: 'accountCtrl',
        //})
        .otherwise({redirectTo: '/'});

    // use the HTML5 History API
    $locationProvider.html5Mode(true);
}

function run($rootScope, $location, authentication) {
    $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
        if ($location.path() === '/profile' && !authentication.isLoggedIn()) {
            $location.path('/');
        }
    });
}

angular
.module('slira')
.config(['$routeProvider', '$locationProvider', config])
.run(['$rootScope', '$location', 'authentication', run]);

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
            .error(function(err){
                alert(err);
            })
            .then(function(){
                $location.path('profile');
            });
        };
    }
})();;(function () {

  angular
    .module('slira')
    .controller('registerCtrl', registerCtrl);

  registerCtrl.$inject = ['$location', 'authentication'];
    function registerCtrl($location, authentication) {
        var sl = this;

        sl.credentials = {
            name : "",
            email : "",
            password : ""
        };

        sl.onSubmit = function () {
            console.log('Submitting registration');
            authentication
                .register(vm.credentials)
                .error(function(err){
                    alert(err);
                })
                .then(function(){
                    $location.path('profile');
                });
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

        register = function(user) {
            return $http.post('/api/user/create', user).success(function(data){
                saveToken(data.token);
            });
        };

        login = function(user) {
            return $http.post('/api/user/authenticate', user).success(function(data) {
                saveToken(data.token);
            });
        };

        logout = function() {
            $window.localStorage.removeItem('slira-token');
        };

        return {
            currentUser : currentUser,
            saveToken : saveToken,
            getToken : getToken,
            isLoggedIn : isLoggedIn,
            register : register,
            login : login,
            logout : logout
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

})();;(function() {
  
  angular
    .module('slira')
    .controller('indexCtrl', indexCtrl);

    function indexCtrl () {
    	console.log('Index controller is running');
    }

})();;(function() {
  
  angular
    .module('slira')
    .controller('profileCtrl', profileCtrl);

    profileCtrl.$inject = ['$location', 'sliraData'];
    function profileCtrl($location, meanData) {
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
})();;angular.module('templates-dist', ['../client/js/auth/login/login.view.html', '../client/js/auth/register/register.view.html', '../client/js/index/index.view.html', '../client/js/profile/profile.view.html']);

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
    "        <p class=\"lead\">Already a member? Please <a href=\"login\">log in</a> instead.</p>\n" +
    "        <form ng-submit=\"sl.onSubmit()\">\n" +
    "            <div class=\"form-group\">\n" +
    "                <label for=\"name\">Full name</label>\n" +
    "                <input type=\"text\" class=\"form-control\" id=\"name\" placeholder=\"Enter your name\" ng-model=\"sl.credentials.name\">\n" +
    "            </div>\n" +
    "            <div class=\"form-group\">\n" +
    "                <label for=\"email\">Email address</label>\n" +
    "                <input type=\"email\" class=\"form-control\" id=\"email\" placeholder=\"Enter email\" ng-model=\"sl.credentials.email\">\n" +
    "            </div>\n" +
    "            <div class=\"form-group\">\n" +
    "                <label for=\"password\">Password</label>\n" +
    "                <input type=\"password\" class=\"form-control\" id=\"password\" placeholder=\"Password\" ng-model=\"sl.credentials.password\">\n" +
    "            </div>\n" +
    "            <button type=\"submit\" class=\"btn btn-default\">Register!</button>\n" +
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
    "	<p>Please <a href=\"login\">sign in</a> or <a href=\"register\">register</a>?</p>\n" +
    "</div>");
}]);

angular.module("../client/js/profile/profile.view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../client/js/profile/profile.view.html",
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
