(function () {

  angular
  .module('slira')
  .controller('loginCtrl', loginCtrl);

    loginCtrl.$inject = ['$location', 'authentication', '$scope'];

    function loginCtrl($location, authentication, $scope) {
        if(authentication.isLoggedIn()) {
            $location.path('account');    
        }

        $scope.invalidState = true;

        authentication.slackState()
            .then(function(response) {
                if(response.data.success) {
                    $scope.invalidState = false;
                    $scope.state = response.data.state;    
                } else {
                    $scope.message = response.data.msg;    
                }
            })
            .catch(function(err) {
                $scope.message = 'There was an internal error. Please try again by refreshing the page.';  
            })
    }
})();