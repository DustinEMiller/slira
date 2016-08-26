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
                    _id: payload.id,
                    email : payload.email,
                    exp : payload.expiration
                };
            }
        };

       var slackState = function () {
            return $http.post('/api/slack/state')
                .then(function (request) {
                    return request;
                })
                .catch(function (data) {
                    return data;
                });
        };

        var register = function(user) {
            return $http.post('/api/user/create', user).then(function(response) {
                if(response.data.success) {
                    saveToken(response.data.token);    
                }
                return response;
            });
        };

        var login = function(user) {
            return $http.post('/api/user/authenticate', user).then(function(response) {
                if(response.data.success) {
                    saveToken(response.data.token);    
                }
                return response;
            });
        };

        var logout = function() {
            $window.localStorage.removeItem('slira-token');
        };

        return {
            currentUser: currentUser,
            saveToken: saveToken,
            getToken: getToken,
            slackState: slackState,
            isLoggedIn: isLoggedIn,
            register: register,
            login: login,
            logout: logout
        };
    }


})();

/*self.parseJwt = function(token) {
        var base64Url = token.split('.')[1],
            base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse($window.atob(base64));
    }

    self.saveToken = function(token) {
        $window.localStorage['jwtToken'] = token;
    }

    self.getToken = function() {
        return $window.localStorage['jwtToken'];
    }

    self.isAuthed = function() {
        var token = self.getToken();
        if(token) {
            var params = self.parseJwt(token);
            return Math.round(new Date().getTime() / 1000) <= params.exp;
        } else {
            return false;
        }
    }*/