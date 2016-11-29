(function() {

    angular.module('slira', ['ngRoute', 'templates-dist', 'ngMessages']);

    function config ($routeProvider, $locationProvider) {
        $routeProvider
        .when('/', {
            templateUrl: '../client/js/index/index.view.html',
            controller: 'indexCtrl',
        })
        .when('/account', {
            templateUrl: '../client/js/account/account.view.html',
            controller: 'accountCtrl',
        })
        .when('/logout', {
            templateUrl: '../client/js/account/logout.view.html',
            controller: 'logoutCtrl',
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
        .otherwise({redirectTo: '/'});

    // use the HTML5 History API
    $locationProvider.html5Mode(true);
}

function run($rootScope, $location, $templateCache) {

}

angular
.module('slira')
.config(['$routeProvider', '$locationProvider', config])
.run(['$rootScope', '$location', '$templateCache', run]);

})();