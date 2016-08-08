(function () {

  angular
  .module('slira')
  .controller('loginCtrl', loginCtrl);

    loginCtrl.$inject = ['$location', 'authentication'];

    function loginCtrl($location, authentication) {

        var sl = this;

        sl.credentials = {
            email : "",
            password : ""
        };

        sl.onSubmit = function () {
            authentication
            .login(sl.credentials)
            .error(function(err){
                alert(err);
            })
            .then(function(){
                $location.path('profile');
            });
        };
    }
})();