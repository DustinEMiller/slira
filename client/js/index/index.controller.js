(function () {

  angular
  .module('slira')
  .controller('indexCtrl', loginCtrl);

    loginCtrl.$inject = ['$scope'];

    function indexCtrl($scope) {

        $scope.slackLogin = function() {
          window.location = "/login/slack"    
        }
    }
})();