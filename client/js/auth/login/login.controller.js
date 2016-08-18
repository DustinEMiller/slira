(function () {

  angular
  .module('slira')
  .controller('loginCtrl', loginCtrl);

    loginCtrl.$inject = ['$location', 'authentication'];

    function loginCtrl($location, authentication) {

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