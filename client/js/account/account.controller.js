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
                    $scope.jiraUserName = data.data.user.jiraname;
                }

            })
            .catch(function (e) {
                console.log('promise rejected');
            });
    
        checkCredentials();

        $scope.updateJiraName = function() {
            $scope.jiraUserMessage = false;
            sliraData.updateJiraUser({username:$scope.jiraUserName})
                .then(function(data) {
                    if (data.data === 200) {
                        $scope.jiraUserStatusMessage = "User name updated successfully";
                        $scope.jiraUserStatusClass = "success";  
                    } else {
                        $scope.jiraUserStatusMessage = "Unable to update user name";
                        $scope.jiraUserStatusClass = "warning";    
                    }
                    checkCredentials();
                })
                .catch(function(e) {
                    $scope.jiraUserStatusMessage = "Unable to update user name";
                    $scope.jiraUserStatusClass = "warning"; 
                    checkCredentials();
                });
        };

        $scope.updateJiraPassword = function() {
            $scope.jiraPasswordMessage = false;
            sliraData.updateJiraUser({password:$scope.jiraPassword})
                .then(function(data) {
                     if (data.data === 200) {
                        $scope.jiraPasswordStatusMessage = "Password updated successfully";
                        $scope.jiraPasswordStatusClass = "success";  
                    } else {
                        $scope.jiraPasswordStatusMessage = "Unable to update password";
                        $scope.jiraPasswordStatusClass = "warning";    
                    }
                    checkCredentials();
                })
                .catch(function(e) {
                    $scope.jiraPasswordStatusMessage = "Unable to update password";
                    $scope.jiraPasswordStatusClass = "warning"; 
                    checkCredentials();
                });
        };
        
        function checkCredentials() {
            sliraData.checkJira()
            .then(function(data) {
                $scope.jiraMessage = true; 
                if (data.data === 200) {
                    $scope.jiraStatusClass = "success";  
                    $scope.jiraStatusMessage = "Your JIRA credentials are valid.";
                } else if (data.data === 403) {
                    $scope.jiraStatusClass = "alert";  
                    $scope.jiraStatusMessage = "Your JIRA credentials are invalid. Your account needs login validation. Please go to (your JIRA url) and verify your account.";   
                } else {
                    $scope.jiraStatusClass = "alert";  
                    $scope.jiraStatusMessage = "Your JIRA credentials are invalid.";      
                }
            })
            .catch(function(e) {
                $scope.jiraMessage = true; 
                $scope.jiraStatusClass = "warning";  
                $scope.jiraStatusMessage = "Could not verify your account. Please try again.";  
            });        
        }
    }
})();