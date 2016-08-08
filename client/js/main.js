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

})();