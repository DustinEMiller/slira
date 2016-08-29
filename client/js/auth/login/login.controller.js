(function () {

  angular
  .module('slira')
  .controller('loginCtrl', loginCtrl);

    loginCtrl.$inject = ['$location', 'authentication', '$scope'];

    function loginCtrl($location, authentication, $scope) {
        if(authentication.isLoggedIn()) {
            $location.path('account');    
        }
    }
})();