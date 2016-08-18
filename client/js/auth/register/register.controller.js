(function () {

  angular
    .module('slira')
    .controller('registerCtrl', registerCtrl);

  registerCtrl.$inject = ['$location', 'authentication', '$routeParams', '$scope'];
    function registerCtrl($location, authentication, $routeParams, $scope) {
        $scope.message = "";
        $scope.invalidToken = false;
        $scope.invalidRegistration = false;

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
                    $scope.registration.$error.formLevel = true;
                    $scope.invalidToken = true;
                    $scope.message = response.data.msg;    
                }
            })
            .catch(function(err) {
                $scope.registration.$error.formLevel = true;
                $scope.invalidToken = true;
                $scope.message = "Internal error. Please try again";
            })

        $scope.onSubmit = function(isValid) {
            if(isValid) {
                authentication
                .register($scope.credentials)
                .then(function(response) {
                    if(response.data.success) {
                        $location.path('account');
                    } else {
                        $scope.invalidRegistration = true;
                        $scope.registrationMessage = response.data.msg;
                    }
                    
                })
                .catch(function(err) {
                    if(err.data.message == 'child "password" fails because ["password" is not allowed to be empty]') {
                        $scope.registrationMessage = "Password must not be empty";
                    } else if (err.data.message == 'child "password" fails because ["password" length must be at least 6 characters long]') {
                        $scope.message = "Password must be at least 6 characters longs";    
                    } else if (err.data.registrationMessage == 'child "email" fails because ["email" is not allowed to be empty]') {
                        $scope.registrationMessage = "Email must not be empty";
                    } else {
                        $scope.registrationMessage = "There was an error. Please try again.";    
                    }
                });    
            }
        };
    }
})();