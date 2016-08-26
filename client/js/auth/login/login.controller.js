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
                    if(response.data.msg) {
                        $scope.message = response.data.msg;   
                    } else {
                        $scope.message = 'There was an internal error. Please try again by refreshing the page.';      
                    }       
                }
            })
            .catch(function(err) {
                $scope.message = 'There was an internal error. Please try again by refreshing the page.';  
            })
    }
})();