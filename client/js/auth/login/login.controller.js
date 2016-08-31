(function () {

  angular
  .module('slira')
  .controller('loginCtrl', loginCtrl);

    loginCtrl.$inject = ['$location', 'authentication', '$routeParams', '$scope'];

    function loginCtrl($location, authentication, $routeParams, $scope) {
        console.log($routeParams);
        if(authentication.isLoggedIn()) {
            $location.path('account');    
        }
    }
})();