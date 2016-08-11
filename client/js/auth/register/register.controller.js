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
            .then(function(response){
                console.log(response);
                if(response.data.success) {
                    $scope.credentials.email = response.data.email;   
                } else {
                    $scope.invalidToken = true;
                    if(response.error) {
                        $scope.message = response.message; 
                    } else {
                        $scope.message = response.data.msg;    
                    }       
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