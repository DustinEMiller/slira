(function () {

  angular
  .module('slira')
  .controller('loginCtrl', loginCtrl);

    loginCtrl.$inject = ['$scope'];

    function loginCtrl($scope) {

        $scope.slackLogin = function() {
          window.location = "http://54.244.181.96:3000/login/slack"    
        }
    }
})();