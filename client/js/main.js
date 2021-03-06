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
        .otherwise({redirectTo: '/'});

    // use the HTML5 History API
    $locationProvider.html5Mode(true);
}
//https://slack.com/oauth/authorize?scope=identity.basic,identity.team,identity.email&client_id=13949143637.72058318581
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
.run(['$rootScope', '$location', '$templateCache', 'authentication', run]);

})();