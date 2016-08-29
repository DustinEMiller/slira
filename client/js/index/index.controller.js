(function($templateCache) {
  
  angular
    .module('slira')
    .controller('indexCtrl', indexCtrl);

    indexCtrl.$inject = ['$routeParams'];

    function indexCtrl ($routeParams) {
    	console.log($routeParams);
    }

})();