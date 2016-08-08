(function () {

  angular
    .module('slira')
    .controller('registerCtrl', registerCtrl);

  registerCtrl.$inject = ['$location', 'authentication'];
    function registerCtrl($location, authentication) {
        var sl = this;

        sl.credentials = {
            name : "",
            email : "",
            password : ""
        };

        sl.onSubmit = function () {
            console.log('Submitting registration');
            authentication
                .register(vm.credentials)
                .error(function(err){
                    alert(err);
                })
                .then(function(){
                    $location.path('profile');
                });
        };

    }
})();