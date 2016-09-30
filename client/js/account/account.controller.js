(function() {
  
  angular
    .module('slira')
    .controller('accountCtrl', accountCtrl);

    accountCtrl.$inject = ['$location', 'sliraData', '$scope'];

    function accountCtrl($location, sliraData, $scope) {
        $scope.user = {};
        $scope.jiraValid = false;

        sliraData.getProfile()
            .then(function(data) {

                if(data.data.success){
                    $scope.slackUserName = data.data.user.username;
                    $scope.slackTeam = data.data.user.team;
                    $scope.jiraUserName = data.data.user.jiraname;
                }

            })
            .catch(function (e) {
                console.log('promise rejected');
            });

        sliraData.checkJira()
            .then(function(data) {
                if (data === 200) {
                    $scope.jiraValid = true;    
                }
            })
            .catch(function(e) {

            })


        $scope.updateJiraName = function() {

        };

        $scope.updateJiraPassword = function() {

        };
    }
})();