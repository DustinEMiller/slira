(function() {
  
  angular
    .module('slira')
    .controller('accountCtrl', accountCtrl);

    accountCtrl.$inject = ['$location', 'sliraData', '$routeParams', '$scope'];

    function accountCtrl($location, sliraData, $routeParams, $scope) {
        $scope.user = {};
        console.log($routeParams);

        sliraData.getProfile()
            .then(function(data) {
                console.log(data)
                $scope.user = data;
            })
            .catch(function (e) {
                console.log(e);
            });
    }
})();