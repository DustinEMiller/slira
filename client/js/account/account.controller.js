(function() {
  
  angular
    .module('slira')
    .controller('accountCtrl', accountCtrl);

    accountCtrl.$inject = ['$location', 'sliraData'];
    function accountCtrl($location, sliraData) {
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