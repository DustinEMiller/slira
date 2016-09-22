(function () {

  angular
  .module('slira')
  .controller('loginCtrl', loginCtrl);

    loginCtrl.$inject = ['$scope'];

    function loginCtrl($scope) {

        $scope.slackLogin = function() {
          window.location = "http://127.0.0.1:3000/login/slack"    
        }
    }
})();