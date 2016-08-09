(function () {

  angular
    .module('slira')
    .controller('registerCtrl', registerCtrl);

  registerCtrl.$inject = ['$location', 'authentication', '$routeParams', '$scope'];
    function registerCtrl($location, authentication, $routeParams, $scope) {
        console.log($routeParams);
        var sl = this;

        $scope.invalidToken = false;
        $scope.message = ''

        sl.credentials = {
            email : "",
            password : ""
        };

        if (!authentication.validAccessToken($routeParams.registrationToken)) {
        }

        sl.onSubmit = function () {
            console.log('Submitting registration');
            authentication
                .register(sl.credentials)
                .error(function(err){
                    alert(err);
                })
                .then(function(){
                    $location.path('profile');
                });
        };

    }
})();