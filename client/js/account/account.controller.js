(function() {
  
  angular
    .module('slira')
    .controller('accountCtrl', accountCtrl);

    accountCtrl.$inject = ['$location', 'sliraData', '$scope'];

    function accountCtrl($location, sliraData, $scope) {
        $scope.jiraPassword = "";
        $scope.jiraMessage = false;
        $scope.jiraUserMessage = false;
        $scope.jiraPasswordMessage = false;

        sliraData.getProfile()
            .then(function(data) {

                if(data.data.success){
                    $scope.slackUserName = data.data.user.username;
                    $scope.slackTeam = data.data.user.team;
                }
            })
            .catch(function (e) {
                console.log('promise rejected');
            });

        sliraData.getJiraProfile()
            .then(function(data) {
                $scope.jiraMessage = true;
                if (data.data.statusCode === 200) {
                    $scope.jiraStatusClass = "success";
                    $scope.jiraStatusMessage = "Your JIRA account is connected";
                } else if (data.data.statusCode === 204) {
                    $scope.jiraStatusClass = "alert";
                    $scope.jiraStatusMessage = "Your JIRA account is NOT connected. Click here to connect.";
                } else {
                    $scope.jiraStatusClass = "alert";
                    $scope.jiraStatusMessage = "Your user account was not found. How did you even get here?";
                }
            })
            .catch(function(e) {
                $scope.jiraMessage = true;
                $scope.jiraStatusClass = "warning";
                $scope.jiraStatusMessage = "Could not verify your account. Please try again.";
            });


    }
})();