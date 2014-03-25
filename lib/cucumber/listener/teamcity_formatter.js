var teamcityWrite = require("./teamcity/format_for_teamcity.js");
//List of events that can be listened for/handled can be found in "./events.js"

var TeamcityFormatter = function(options) {
    var Cucumber = require('../../cucumber');
    if (!options)
        options = {};

    var failedScenarioLogBuffer = "";
    var statsJournal            = Cucumber.Listener.StatsJournal();
    var self                    = Cucumber.Listener.Formatter(options);
 
    var parentHear = self.hear;
    self.hear = function hear(event, callback) {
        statsJournal.hear(event, function () {
            parentHear(event, callback);
        });
    };
    
    //
    //Feature handling
    //
    self.handleBeforeFeaturesEvent = function handleBeforeFeaturesEvent(event, callback) {
        callback();
    };

    self.handleBeforeFeatureEvent = function handleBeforeFeatureEvent(event, callback) {
        var feature_name = event.getPayloadItem('feature').getName();
        self.log(teamcityWrite("testSuiteStarted", ["name", feature_name]));
        callback();
    };
    
    self.handleAfterFeatureEvent = function handleAfterFeatureEvent(event, callback) {
        var feature_name = event.getPayloadItem('feature').getName();
        self.log(teamcityWrite("testSuiteFinished", ["name", feature_name]));
        callback();
    };

    self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {

        self.logSteps();
        //self.publishArtifacts();

        var buildFailed = statsJournal.witnessedAnyFailedStep();
        var scenario_count = statsJournal.getFailedScenarioCount();
                                          
        if (buildFailed) {
            self.log(teamcityWrite("buildProblem", ["description", "The build failed because one or more steps in "+ scenario_count +" tests failed."]));
            callback();
        } else {
            self.log(teamcityWrite("buildStatus", ["status","SUCCESS" ,"description", "Build was succesful."]));
            callback();
        }
    };
    
    //
    //Scenario handling
    //
    self.handleBeforeScenarioEvent = function (event, callback) {
        var scenario_name = event.getPayloadItem('scenario').getName();
        self.log(teamcityWrite("testStarted", ["name", scenario_name, "captureStandardOutput", "true"]));
        callback();
    };

    //self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
    //    var scenario = event.getPayloadItem('scenario');
    //    var name = scenario.getName();
    //    var uri = scenario.getUri();
    //    var line = scenario.getLine();
    //    var failed_message = "Test failed at line " + line + " in " + uri;
    //    var message = "Location: " + uri + " , line " + line;
        
    //    if (statsJournal.isCurrentScenarioFailing()) {
    //        self.log(teamcityWrite("testFailed", ["name", name, "message", failed_message]));
    //        self.log(teamcityWrite("testFinished", ["name", name]));
    //        callback();
    //    } else {
    //        self.log(teamcityWrite("testStdOut", ["name", name, "out",message]));
    //        self.log(teamcityWrite("testFinished", ["name", name]));
    //        callback();
    //    }
    //};

    self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
        var scenario = event.getPayloadItem('scenario');
        var name = scenario.getName();
        var uri = scenario.getUri();
        var line = scenario.getLine();
        var failed_message = "Test failed at line " + line + " in " + uri;
        var ignored_message = "Test ignored at line " + line + " in " + uri;
        var message = "Location: " + uri + " , line " + line;

        if (statsJournal.isCurrentScenarioFailing()) {
            self.log(teamcityWrite("testFailed", ["name", name, "message", failed_message]));
        } else if (statsJournal.isCurrentScenarioUndefined()) {
            self.log(teamcityWrite("testFailed", ["name", name, "message", failed_message]));
        } else if (statsJournal.isCurrentScenarioPending()) {
            self.log(teamcityWrite("testIgnored", ["name", name, "message", ignored_message]));
        } else {
            self.log(teamcityWrite("testStdOut", ["name", name, "out", message]));
        }
        self.log(teamcityWrite("testFinished", ["name", name]));
        callback();
        
    };

    //
    //Helpers
    //
    self.logSteps = function logSteps() {
        var stepCount = statsJournal.getStepCount();
        var passedStepCount = statsJournal.getPassedStepCount();
        var pendingStepCount = statsJournal.getPendingStepCount();
        var skippedStepCount = statsJournal.getSkippedStepCount();
        var undefinedStepCount = statsJournal.getUndefinedStepCount();
        var failedStepCount = statsJournal.getFailedStepCount();

        self.log(teamcityWrite("buildStatisticValue", ["key", "steps", "value", stepCount]));
        self.log(teamcityWrite("buildStatisticValue", ["key", "passedSteps", "value", passedStepCount]));
        self.log(teamcityWrite("buildStatisticValue", ["key", "pendingSteps", "value", pendingStepCount]));
        self.log(teamcityWrite("buildStatisticValue", ["key", "skippedSteps", "value", skippedStepCount]));
        self.log(teamcityWrite("buildStatisticValue", ["key", "undefinedSteps", "value", undefinedStepCount]));
        self.log(teamcityWrite("buildStatisticValue", ["key", "failedSteps", "value", failedStepCount]));
    };

    //self.writeToTeamcity = function writeToTeamcity(args) {

    //    self.log(self.formatForTeamcity(args));

    //}

    //self.formatForTeamcity = function formatForTeamcity(args) {



    //}





    //self.publishArtifacts = function publishArtifacts() {

    //    //Put a teamcity message here if teamcity should collect artifacts from a file
    //    //See more: http://confluence.jetbrains.com/display/TCD8/Build+Script+Interaction+with+TeamCity#BuildScriptInteractionwithTeamCity-PublishingArtifactswhiletheBuildisStillinProgress

    //};

    return self;
};
module.exports                             = TeamcityFormatter;





