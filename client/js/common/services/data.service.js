(function() {

  angular
	.module('slira')
	.service('sliraData', sliraData);

  sliraData.$inject = ['$http', 'authentication'];

  function sliraData ($http, authentication) {

	var getProfile = function () {
	  	return $http.get('/api/user/information', {
			headers: {
		  		Authorization: 'Bearer '+ authentication.getToken()
			}
	  	});
	};

	return {
	  	getProfile : getProfile
	};
  }

})();