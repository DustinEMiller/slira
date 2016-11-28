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
        

        sliraData.getProfile()
            .then(function(data) {

                if(data.data.success){
                    $scope.slackUserName = data.data.user.username;
                    $scope.slackTeam = data.data.user.team;
                    $scope.jiraUserName = data.data.user.jiraname;
                }

            })
            .catch(function (e) {
                console.log('promise rejected');
            });
    
       //checkCredentials();

        $scope.updateJiraName = function() {
            $scope.jiraUserMessage = false;
            
            sliraData.updateJiraUser({username:$scope.jiraUserName})
                .then(function(data) {
                    if (data.data === 200) {
                        $scope.jiraUserStatusMessage = "User name updated successfully";
                        $scope.jiraUserStatusClass = "success";  
                    } else {
                        $scope.jiraUserStatusMessage = "Unable to update user name";
                        $scope.jiraUserStatusClass = "warning";    
                    }
                    $scope.jiraUserMessage = true;
                    checkCredentials();
                })
                .catch(function(e) {
                    $scope.jiraUserStatusMessage = "Unable to update user name";
                    $scope.jiraUserStatusClass = "warning"; 
                    $scope.jiraUserMessage = true;
                    checkCredentials(); 
                });
        };

        $scope.updateJiraPassword = function() {
            $scope.jiraPasswordMessage = false;
            
            sliraData.updateJiraUser({password:$scope.jiraPassword})
                .then(function(data) {
                     if (data.data === 200) {
                        $scope.jiraPasswordStatusMessage = "Password updated successfully";
                        $scope.jiraPasswordStatusClass = "success";  
                    } else {
                        $scope.jiraPasswordStatusMessage = "Unable to update password";
                        $scope.jiraPasswordStatusClass = "warning";    
                    }
                    $scope.jiraPasswordMessage = true;
                    checkCredentials();
                })
                .catch(function(e) {
                    $scope.jiraPasswordStatusMessage = "Unable to update password";
                    $scope.jiraPasswordStatusClass = "warning";
                    $scope.jiraPasswordMessage = true;
                    checkCredentials();
                });
        };
        
        function checkCredentials() {
            sliraData.checkJira()
            .then(function(data) {
                $scope.jiraMessage = true; 
                if (data.data === 200) {
                    $scope.jiraStatusClass = "success";  
                    $scope.jiraStatusMessage = "Your JIRA credentials are valid.";
                } else if (data.data === 403) {
                    $scope.jiraStatusClass = "alert";  
                    $scope.jiraStatusMessage = "Your JIRA credentials are invalid. Your account needs login validation. Please go to (your JIRA url) and verify your account.";   
                } else {
                    $scope.jiraStatusClass = "alert";  
                    $scope.jiraStatusMessage = "Your JIRA credentials are invalid.";      
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
            return $http.get('/api/user/information')
                .then(function (request) {
                    return request;
                })
                .catch(function (error) {
                    return error;
                });
    	};

        var checkJira = function () {
            return $http.get('/api/jira/check')
                .then(function (request) {
                    console.log(request);
                    return request;
                })
                .catch(function (error) {
                    return error;
                });
        };

        var updateJiraUser = function (user) {
            return $http.post('/api/jira/update/user', user)
                .then(function (request) {
                    console.log(request);
                    return request;
                })
                .catch(function (error) {
                    return error;
                });
        };


    	return {
    	  	getProfile: getProfile,
            checkJira: checkJira,
            updateJiraUser: updateJiraUser
    	};
    }

})();;angular.module('templates-dist', ['../client/js/account/account.view.html', '../client/js/errors/denied.view.html', '../client/js/errors/loginError.view.html', '../client/js/errors/notFound.view.html', '../client/js/errors/unauthorized.view.html']);

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
