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

})();;(function() {
  
  angular
    .module('slira')
    .controller('accountCtrl', accountCtrl);

    accountCtrl.$inject = ['$location', 'sliraData', '$scope'];

    function accountCtrl($location, sliraData, $scope) {
        $scope.jiraPassword = "";
        $scope.jiraMessage = false;
        $scope.jiraUserMessage = false;
        $scope.jiraPasswordMessage = false;

        console.log(sliraData);

        sliraData.getProfile()
            .then(function(data) {

                if(data.data.success){
                    $scope.slackUserName = data.data.user.username;
                    $scope.slackTeam = data.data.user.team;
                }
                checkJira();
            })
            .catch(function (e) {
                console.log('promise rejected');
                checkJira();
            });

        function checkJira() {
            sliraData.getJiraProfile()
                .then(function(data) {
                    $scope.jiraMessage = true;
                    if (data.statusCode === 200) {
                        $scope.jiraStatusClass = "success";
                        $scope.jiraStatusMessage = "Your JIRA account is connected";
                    } else if (data.statusCode === 204) {
                        $scope.jiraStatusClass = "alert";
                        $scope.jiraStatusMessage = "Your JIRA account is NOT connected. Click here to connect.";
                    } else if (data.statusCode === 500) {
                        $scope.jiraStatusClass = "alert";
                        $scope.jiraStatusMessage = "Your user account was not found. How did you even get here?";
                    }
                })
                .catch(function(e) {
                    $scope.jiraMessage = true;
                    $scope.jiraStatusClass = "warning";
                    $scope.jiraStatusMessage = "Could not verify your account. Please try again.";
                });

        }

    }
})();;(function () {
    angular
        .module('slira')
        .controller('logoutCtrl', logoutCtrl);

    logoutCtrl.$inject = ['$scope'];

    function logoutCtrl($scope) {
    }
})();
;(function() {

  angular
	.module('slira')
	.service('sliraData', sliraData);

  sliraData.$inject = ['$http'];

    function sliraData ($http) {

    	var getProfile = function () {
            return $http.get('/api/user/information')
                .then(function (request) {
                    return request;
                })
                .catch(function (error) {
                    return error;
                });
    	};

        var getJiraProfile = function () {
            return $http.get('/check/user')
                .then(function (request) {
                    console.log(request);
                    return request;
                })
                .catch(function (error) {
                    console.log(error);
                    return error;
                });
        };

    	return {
            getJiraProfile: getJiraProfile,
    	  	getProfile: getProfile
    	};
    }

})();;(function () {

    angular
        .module('slira')
        .controller('indexCtrl', indexCtrl);

    indexCtrl.$inject = ['$scope'];

    function indexCtrl($scope) {

        $scope.slackLogin = function() {
            window.location = "/account"
        }
    }
})();;angular.module('templates-dist', ['../client/js/account/account.view.html', '../client/js/account/logout.view.html', '../client/js/errors/denied.view.html', '../client/js/errors/loginError.view.html', '../client/js/errors/notFound.view.html', '../client/js/errors/unauthorized.view.html', '../client/js/index/index.view.html']);

angular.module("../client/js/account/account.view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../client/js/account/account.view.html",
    "<navigation></navigation>\n" +
    "<div class=\"row\">\n" +
    "    <div class=\"small-12 columns\"><h2>Your Accounts</h2></div>\n" +
    "</div>\n" +
    "<div class=\"row\">\n" +
    "    <div class=\"small-6 columns\">\n" +
    "        <h2>Slack Details</h2>\n" +
    "        <h4>{{slackTeam}}</h4>\n" +
    "        <h5>{{slackUserName}}</h5>\n" +
    "    </div>\n" +
    "    <div class=\"small-6 columns\">\n" +
    "        <h2>JIRA Details</h2>\n" +
    "        <h4>{{jiraUsermame}}</h4>\n" +
    "\n" +
    "        <div class=\"{{jiraStatusClass}} callout\" ng-show=\"jiraMessage\">\n" +
    "            <p>{{jiraStatusMessage}}</p>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("../client/js/account/logout.view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../client/js/account/logout.view.html",
    "<navigation></navigation>\n" +
    "<div>\n" +
    "    <div class=\"small-12 columns\">\n" +
    "        <p>You have been logged out.</p>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("../client/js/errors/denied.view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../client/js/errors/denied.view.html",
    "");
}]);

angular.module("../client/js/errors/loginError.view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../client/js/errors/loginError.view.html",
    "loginError");
}]);

angular.module("../client/js/errors/notFound.view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../client/js/errors/notFound.view.html",
    "");
}]);

angular.module("../client/js/errors/unauthorized.view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../client/js/errors/unauthorized.view.html",
    "You're not allowed");
}]);

angular.module("../client/js/index/index.view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../client/js/index/index.view.html",
    "<navigation></navigation>\n" +
    "<div>\n" +
    "    <h1>Greetings</h1>\n" +
    "    <div class=\"small-12 columns\">\n" +
    "        <p><a ng-click=\"slackLogin()\">Log In</a></p>\n" +
    "    </div>\n" +
    "</div>");
}]);
