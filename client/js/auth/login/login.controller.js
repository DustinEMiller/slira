(function () {

  angular
  .module('slira')
  .controller('loginCtrl', loginCtrl);

    loginCtrl.$inject = ['$location', 'authentication', '$scope'];

    function loginCtrl($location, authentication, $scope) {
        
        if(authentication.isLoggedIn()) {
            $location.path('account');    
        }

        $scope.slackLogin = function() {
          console.log('login');
          authentication.slackLogin()
            .then(function(response) {
              console.log(response);    
            })
            .catch(function(err) {
                console.log(err);
            })
        }
    }
})();