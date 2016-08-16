(function () {

  angular
    .module('slira')
    .controller('registerCtrl', registerCtrl);

  registerCtrl.$inject = ['$location', 'authentication', '$routeParams', '$scope'];
    function registerCtrl($location, authentication, $routeParams, $scope) {
        $scope.invalidToken = false;
        $scope.registration.message = "";

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
                    $scope.invalidToken = true;
                    $scope.registration.message = response.data.msg;    
                }
            })
            .catch(function(err) {
                $scope.invalidToken = true;
                $scope.registration.message = "Internal error. Please try again";
            })

        $scope.onSubmit = function(isValid) {
            if(isValid) {
                authentication
                .register($scope.credentials)
                .then(function(response) {
                    if(response.data.success) {
                        $location.path('account');
                    } else {
                        $scope.registration.message = response.data.msg;
                    }
                    
                })
                .catch(function(err) {
                    if(err.data.message == 'child "password" fails because ["password" is not allowed to be empty]') {
                        $scope.registration.message = "Password must not be empty";
                    } else if (err.data.message == 'child "password" fails because ["password" length must be at least 6 characters long]') {
                        $scope.registration.message = "Password must be at least 6 characters longs";    
                    } else if (err.data.message == 'child "email" fails because ["email" is not allowed to be empty]') {
                        $scope.registration.message = "Email must not be empty";
                    } else {
                        $scope.registration.message = "There was an error. Please try again.";    
                    }
                });    
            }
        };
    }
})();