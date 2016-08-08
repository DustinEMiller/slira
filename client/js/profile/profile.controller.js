(function() {
  
  angular
    .module('slira')
    .controller('profileCtrl', profileCtrl);

    profileCtrl.$inject = ['$location', 'sliraData'];
    function profileCtrl($location, meanData) {
        var sl = this;

        sl.user = {};

    sliraData.getProfile()
        .success(function(data) {
            sl.user = data;
        })
        .error(function (e) {
            console.log(e);
        });
    }
})();