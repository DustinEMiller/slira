(function() {

  angular
	.module('slira')
	.service('sliraData', sliraData);

  sliraData.$inject = ['$http'];

    function sliraData ($http) {

    	var getProfile = function () {
            return $http.get('/api/user/information')
                .then(function (request) {
                    return request;
                })
                .catch(function (error) {
                    return error;
                });
    	};

        var getJiraProfile = function () {
            return $http.get('/check/user')
                .success(function (request) {
                    return request;
                })
                .error(function (error) {
                    return error;
                });
        };

    	return {
            getJiraProfile: getJiraProfile,
    	  	getProfile: getProfile
    	};
    }

})();