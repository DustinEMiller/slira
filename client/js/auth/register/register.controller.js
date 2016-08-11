(function () {

  angular
    .module('slira')
    .controller('registerCtrl', registerCtrl);

  registerCtrl.$inject = ['$location', 'authentication', '$routeParams', '$scope'];
    function registerCtrl($location, authentication, $routeParams, $scope) {
        $scope.invalidToken = false;
        $scope.message = "";

        $scope.credentials = {
            email: "",
            password: "",
            token: $routeParams.registrationToken
        };

        authentication.registrationToken($routeParams.registrationToken)
            .then(function(data){

                if(data.success) {
                    $scope.credentials.email = data.email;   
                } else {
                    $scope.invalidToken = true;
                    $scope.message = data.msg;   
                }
            })
            .catch(function(err){
                $scope.invalidToken = true;
                $scope.message = "Internal error. Please try again";
            })

        $scope.onSubmit = function () {
            authentication
                .register($scope.credentials)
                .then(function(data){
                    if(data.success){
                        $location.path('account');
                    } else {
                        $scope.message = data.msg;
                    }
                    
                })
                .catch(function(err){
                    $scope.message = err.msg;
                })
        };

    }
})();