(function () {

    angular
        .module('slira')
        .controller('indexCtrl', indexCtrl);

    indexCtrl.$inject = ['$scope'];

    function indexCtrl($scope) {

        $scope.slackLogin = function() {
            window.location = "/account"
        }
    }
})();