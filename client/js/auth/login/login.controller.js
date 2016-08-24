(function () {

  angular
  .module('slira')
  .controller('loginCtrl', loginCtrl);

    loginCtrl.$inject = ['$location', 'authentication', '$scope'];

    function loginCtrl($location, authentication, $scope) {
        if(authentication.isLoggedIn()) {
            $location.path('account');    
        }

        authentication.registrationToken($routeParams.registrationToken)
            .then(function(response) {
                console.log(response);
                if(response.data.success) {
                    $scope.state = response.data.email;   
                } else {
                    //$scope.registration.$error.formLevel = true;
                    //$scope.invalidToken = true;
                    //$scope.message = response.data.msg;    
                }
            })
            .catch(function(err) {
                //$scope.registration.$error.formLevel = true;
                //$scope.invalidToken = true;
                //$scope.message = "Internal error. Please try again";
            })

        $scope.credentials = {
            email : "",
            password : ""
        };

        $scope.onSubmit = function () {
            authentication
            .login($scope.credentials)
            .then(function(response){
                if(response.data.success) {
                    $location.path('account');
                } else {
                    $scope.invalidLogin = true;
                    $scope.message = response.data.msg;
                }
            })
            .catch(function(err){
                $scope.message = "There was an error logging in. Please try again.";
            });
        };
    }
})();