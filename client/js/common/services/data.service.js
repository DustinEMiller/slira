(function() {

  angular
	.module('slira')
	.service('sliraData', sliraData);

  sliraData.$inject = ['$http', 'authentication'];

  function sliraData ($http, authentication) {

	var getProfile = function () {
        return $http.get('/api/user/information')
            .then(function (request) {
                return request;
            })
            .catch(function (error) {
                return error;
            });
	};

    var checkJira = function () {
        return $http.get('/api/jira/check')
            .then(function (request) {
                return request;
            })
            .catch(function (error) {
                return error;
            });
    };

	return {
	  	getProfile : getProfile,
        checkJira : checkJira,
	};
  }

})();