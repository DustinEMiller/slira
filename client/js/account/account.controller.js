(function() {
  
  angular
    .module('slira')
    .controller('accountCtrl', accountCtrl);

    accountCtrl.$inject = ['$location', 'sliraData', '$scope'];
    
    function accountCtrl($location, sliraData, $scope) {
        $scope.user = {};

    sliraData.getProfile()
        .success(function(data) {
            $scope.user = data;
        })
        .error(function (e) {
            console.log(e);
        });
    }
})();