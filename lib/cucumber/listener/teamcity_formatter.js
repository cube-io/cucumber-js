var teamcityWrite = require("./teamcity/format_for_teamcity.js");

var TeamcityFormatter = function(options) {
    var Cucumber = require('../../cucumber');
    if (!options)
        options = {};

    var failedScenarioLogBuffer = "";
    var statsJournal            = Cucumber.Listener.StatsJournal();
    var self                    = Cucumber.Listener.Formatter(options);
 
    self.log(teamcityWrite("testSuiteStarted", ["name", "SIP-services"]));

    var parentHear = self.hear;
    self.hear = function hear(event, callback) {
        statsJournal.hear(event, function () {
            parentHear(event, callback);
        });
    };

    self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
        var scenario = event.getPayloadItem('scenario');
        var name = scenario.getName();
        var uri = scenario.getUri();
        var line = scenario.getLine();
        var message = "Test failed at line " + line + " in " + uri;

        self.log(teamcityWrite("testStarted", ["name", name, "captureStandardOutput", "true"]));

        if (statsJournal.isCurrentScenarioFailing()) {
            self.log(teamcityWrite("testFailed", ["name", name, "message", message]));
        } else {
            self.log(teamcityWrite("testStdOut", ["name", name, "out", "URI: " + uri]));
        }
        self.log(teamcityWrite("testFinished", ["name", name]));

        callback();
    };

    self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {

        self.logSteps();
        //self.publishArtifacts();
    
        var buildFailed = statsJournal.witnessedAnyFailedStep();

        if (buildFailed) {
            self.log(teamcityWrite("buildProblem", ["description", "The build failed because one or more steps in one or more scenarios faild."]));
            self.log(teamcityWrite("testSuiteFinished", ["name", "SIP-services"]));
            callback();
        } else {
            self.log(teamcityWrite("testSuiteFinished", ["name", "SIP-services"]));
            callback();
        }
    };

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

    self.publishArtifacts = function publishArtifacts() {

        //Put a teamcity message here if teamcity should collect artifacts from a file
        //See more: http://confluence.jetbrains.com/display/TCD8/Build+Script+Interaction+with+TeamCity#BuildScriptInteractionwithTeamCity-PublishingArtifactswhiletheBuildisStillinProgress

    };


    return self;
};
module.exports                             = TeamcityFormatter;





