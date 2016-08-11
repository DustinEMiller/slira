(function () {

  angular
    .module('slira')
    .service('authentication', authentication);

  authentication.$inject = ['$http', '$window'];
    function authentication ($http, $window) {

        var saveToken = function (token) {
            $window.localStorage['slira-token'] = token;
        };

        var getToken = function () {
            return $window.localStorage['slira-token'];
        };

        var isLoggedIn = function() {
            var token = getToken();
            var payload;

            if(token){
                payload = token.split('.')[1];
                payload = $window.atob(payload);
                payload = JSON.parse(payload);

                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        };

        var currentUser = function() {
            if(isLoggedIn()){
                var token = getToken();
                var payload = token.split('.')[1];
                payload = $window.atob(payload);
                payload = JSON.parse(payload);
                return {
                    email : payload.email,
                    name : payload.name
                };
            }
        };

       var registrationToken = function (registrationToken) {
            return $http.post('/api/user/registrationRequest', {token: registrationToken})
                .then(function (request) {
                    return {status: request.data.status, email: request.data.email, slackUserName: request.data.slackUserName};
                })
                .catch(function (data) {
                    return {status: data.status};
                });
        };

        var register = function(user) {
            return $http.post('/api/user/create', user).then(function (data) {
                saveToken(data.token);
            });
        };

        var login = function(user) {
            return $http.post('/api/user/authenticate', user).then(function (data) {
                saveToken(data.token);
            });
        };

        var logout = function() {
            $window.localStorage.removeItem('slira-token');
        };

        return {
            currentUser: currentUser,
            saveToken: saveToken,
            getToken: getToken,
            isLoggedIn: isLoggedIn,
            register: register,
            registrationToken: registrationToken,
            login: login,
            logout: logout
        };
    }


})();