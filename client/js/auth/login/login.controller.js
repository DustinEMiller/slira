(function () {

  angular
  .module('slira')
  .controller('loginCtrl', loginCtrl);

    loginCtrl.$inject = ['$scope'];

    function loginCtrl($scope) {

        $scope.slackLogin = function() {
            window.location = "/login/slack"    
        }
    }
})();