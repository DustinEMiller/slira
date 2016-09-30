(function() {
  
  angular
    .module('slira')
    .controller('accountCtrl', accountCtrl);

    accountCtrl.$inject = ['$location', 'sliraData', '$scope'];

    function accountCtrl($location, sliraData, $scope) {
        $scope.jiraPassword = "";

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
                if (data.data === 200) {
                    $scope.jiraValid = true;    
                }
            })
            .catch(function(e) {

            });


        $scope.updateJiraName = function() {
            sliraData.updateJiraUser({username:$scope.jiraUserName})
                .then(function(data) {

                })
                .catch(function(e) {

                });
        };

        $scope.updateJiraPassword = function() {
            sliraData.updateJiraUser({password:$scope.jiraPassword})
                .then(function(data) {

                })
                .catch(function(e) {

                });
        };
    }
})();