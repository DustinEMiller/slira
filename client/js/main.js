'use strict'

(() => {

    angular.module('slira', ['ngRoute']);

    function config ($routeProvider, $locationProvider) {
        $routeProvider
        .when('/', {
            templateUrl: 'index/index.view.html',
            controller: 'indexCtrl',
        })
        .when('/register', {
            templateUrl: '/auth/register/register.view.html',
            controller: 'registerCtrl',
        })
        .when('/login', {
            templateUrl: '/auth/login/login.view.html',
            controller: 'loginCtrl',
        })
        .when('/account', {
            templateUrl: '/account/account.view.html',
            controller: 'accountCtrl',
        })
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

})();
/*;(function(){
    function authInterceptor(API, auth) {
        return {
            request: function(config) {
                var token = auth.getToken();

                if(config.url.indexOf(API) === 0 && token) {
                    config.headers.Authorization = 'Bearer ' + token;
                }

                return config;
            },

            response: function(res) {
                if(res.config.url.indexOf(API) === 0 && res.data.token) {
                    auth.saveToken(res.data.token);
                }

                return res;
            },
        }
    }

function authService($window) {
    var self = this;

    self.parseJwt = function(token) {
        var base64Url = token.split('.')[1],
            base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse($window.atob(base64));
    }

    self.saveToken = function(token) {
        $window.localStorage['jwtToken'] = token;
    }

    self.getToken = function() {
        return $window.localStorage['jwtToken'];
    }

    self.isAuthed = function() {
        var token = self.getToken();
        if(token) {
            var params = self.parseJwt(token);
            return Math.round(new Date().getTime() / 1000) <= params.exp;
        } else {
            return false;
        }
    }

    self.logout = function() {
        $window.localStorage.removeItem('jwtToken');
    }
}

function userService($http, API, auth) {
    var self = this;  

    self.register = function(email, password, jiraName, jiraPassword, slackName) {
        return $http.post(API + '/api/user/create', {
            email: email,
            password: password,
            jiraUserName: jiraName,
            jiraPassword: jiraPassword,
            slackUserName: slackName
        })
    }

    self.login = function(email, password) {
        return $http.post(API + '/api/user/authenticate', {
            email: email,
            password: password
        })
    };

}

function MainCtrl(user, auth) {
    var self = this;

    function handleRequest(res) {
        var token = res.data ? res.data.token : null;
        if(token) { console.log('JWT:', token); }
        self.message = res.data.message;
    }

    self.login = function() {
        user.login(self.username, self.password)
        .then(handleRequest, handleRequest)
    }

    self.register = function() {
        user.register(self.email, self.password, self.jiraUserName, self.jiraPassword, self.slackUsername)
        .then(handleRequest, handleRequest)
    }

    self.logout = function() {
        auth.logout && auth.logout()
    }
    
    self.isAuthed = function() {
        return auth.isAuthed ? auth.isAuthed() : false
    }
}

angular.module('app', [])
.factory('authInterceptor', authInterceptor)
.service('user', userService)
.service('auth', authService)
.constant('API', 'http://localhost:3000')
.config(function($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
})
.controller('Main', MainCtrl)
})();*/