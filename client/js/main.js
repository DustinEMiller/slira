(function() {

    angular.module('slira', ['ngRoute', 'templates-dist', 'ngMessages']);

    function config ($routeProvider, $locationProvider) {
        $routeProvider
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
        .when('/denied', {
            templateUrl: '../client/js/errors/denied.html'
        })
        .when('/notFound', {
            templateUrl: '../client/js/errors/notFound.html'
        })
        .otherwise({redirectTo: '/account'});

    // use the HTML5 History API
    $locationProvider.html5Mode(true);
}

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

})();