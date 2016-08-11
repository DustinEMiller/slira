(function () {

  angular
    .module('slira')
    .controller('registerCtrl', registerCtrl);

  registerCtrl.$inject = ['$location', 'authentication', '$routeParams', '$scope'];
    function registerCtrl($location, authentication, $routeParams, $scope) {
        console.log($routeParams);
        var sl = this;

        $scope.invalidToken = false;
        $scope.message = "";

        sl.credentials = {
            email : "",
            password : "",
        };

        authentication.registrationToken($routeParams.registrationToken)
            .then(function(data){

                switch(data.status) {
                    case 'notFound':
                        $scope.invalidToken = true;
                        $scope.message = "The supplied registration token does not exist.";
                        break;
                    case 'expired':
                        $scope.invalidToken = true;
                        $scope.message = "The supplied registration token has expired.";
                        break;
                    case 'spent':
                        $scope.invalidToken = true;
                        $scope.message = "The supplied registration token has already been used.";
                        break;
                    case 'good':
                        sl.credentials.email = data.email;
                        break;
                }
            })
            .catch(function(err){
                $scope.invalidToken = true;
                $scope.message = "Internal error. Please try again";
            })

        sl.onSubmit = function () {
            console.log('Submitting registration');
            authentication
                .register(sl.credentials)
                .then(function(){
                    $location.path('account');
                })
                .catch(function(err){
                    alert(err);
                })
        };

    }
})();