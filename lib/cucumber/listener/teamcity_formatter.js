
//List of events that can be listened for/handled can be found in "./events.js"

var TeamcityFormatter = function(options) {
    var util = require("util");
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
        self.writeToTeamcity("testSuiteStarted", ["name", feature_name]);
        callback();
    };
    
    self.handleAfterFeatureEvent = function handleAfterFeatureEvent(event, callback) {
        var feature_name = event.getPayloadItem('feature').getName();
        self.writeToTeamcity("testSuiteFinished", ["name", feature_name]);
        callback();
    };

    self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {

        self.logSteps();
        //self.publishArtifacts();

        var buildFailed = statsJournal.witnessedAnyFailedStep() || statsJournal.witnessedAnyUndefinedStep();
        var scenario_count = statsJournal.getFailedScenarioCount() + statsJournal.getUndefinedScenarioCount();
                                          
        if (buildFailed) {
            self.writeToTeamcity("buildProblem", ["description", "The build failed because one or more steps in "+ scenario_count +" tests failed."]);
            callback();
        } else {
            self.writeToTeamcity("buildStatus", ["status","SUCCESS" ,"description", "Build was succesful."]);
            callback();
        }
    };
    
    //
    //Scenario handling
    //
    self.handleBeforeScenarioEvent = function (event, callback) {
        var scenario_name = event.getPayloadItem('scenario').getName();
        self.writeToTeamcity("testStarted", ["name", scenario_name, "captureStandardOutput", "true"]);
        callback();
    };

    self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
        var scenario = event.getPayloadItem('scenario');
        var name = scenario.getName();
        var uri = scenario.getUri();
        var line = scenario.getLine();
        var failed_message = "Test failed at line " + line + " in " + uri;
        var ignored_message = "Test ignored at line " + line + " in " + uri;
        var message = "Location: " + uri + " , line " + line;

        if (statsJournal.isCurrentScenarioFailing()) {
            self.writeToTeamcity("testFailed", ["name", name, "message", failed_message]);
        } else if (statsJournal.isCurrentScenarioUndefined()) {
            self.writeToTeamcity("testFailed", ["name", name, "message", failed_message]);
        } else if (statsJournal.isCurrentScenarioPending()) {
            self.writeToTeamcity("testIgnored", ["name", name, "message", ignored_message]);
        } else { //Success
            self.writeToTeamcity("testStdOut", ["name", name, "out", message]);
        }

        self.writeToTeamcity("testFinished", ["name", name]);
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

        self.writeToTeamcity("buildStatisticValue", ["key", "steps", "value", stepCount]);
        self.writeToTeamcity("buildStatisticValue", ["key", "passedSteps", "value", passedStepCount]);
        self.writeToTeamcity("buildStatisticValue", ["key", "pendingSteps", "value", pendingStepCount]);
        self.writeToTeamcity("buildStatisticValue", ["key", "skippedSteps", "value", skippedStepCount]);
        self.writeToTeamcity("buildStatisticValue", ["key", "undefinedSteps", "value", undefinedStepCount]);
        self.writeToTeamcity("buildStatisticValue", ["key", "failedSteps", "value", failedStepCount]);
    };

    self.writeToTeamcity = function writeToTeamcity(messagetype, args) {
        self.log(self.formatForTeamcity(messagetype,args));
    }

    self.formatForTeamcity = function write(messagetype, args) {
        var output = "##teamcity[" + messagetype + " ";

        if (util.isArray(args)) {
            var counter = args.length / 2;
            var i;
            for (i = 0; i <= counter; i = i + 2) {
                //args[i] is the attribute name
                //args[i+1] is the attribute value
                output += args[i] + "=" + "'" + args[i + 1] + "'" + " ";
            }
        } //else trow error
        output += "]\n";
        return output;
    }

    //self.publishArtifacts = function publishArtifacts() {

    //    //Put a teamcity message here if teamcity should collect artifacts from a file
    //    //See more: http://confluence.jetbrains.com/display/TCD8/Build+Script+Interaction+with+TeamCity#BuildScriptInteractionwithTeamCity-PublishingArtifactswhiletheBuildisStillinProgress

    //};

    return self;
};
module.exports                             = TeamcityFormatter;





