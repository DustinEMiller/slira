(function() {
  
  angular
    .module('slira')
    .controller('accountCtrl', accountCtrl);

    accountCtrl.$inject = ['$location', 'sliraData', '$scope'];

    function accountCtrl($location, sliraData, $scope) {
        $scope.user = {};
        console.log(sliraData.getProfile());
        sliraData.getProfile()
            .then(function(data) {
                console.log('promise returned');
                $scope.user = data;
            })
            .catch(function (e) {
                console.log('promise rejected');
            });
    }
})();