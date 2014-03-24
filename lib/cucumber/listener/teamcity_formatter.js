var ConsoleColor = require('../util/colors');
var teamcityWrite = require("./teamcity/format_for_teamcity.js");

var TeamcityFormatter = function(options) {
    var Cucumber = require('../../cucumber');
    if (!options)
        options = {};

    var failedScenarioLogBuffer = "";
    var statsJournal            = Cucumber.Listener.StatsJournal();
    var self                    = Cucumber.Listener.Formatter(options);
  
    //Write start of test to teamcity. Could also be test suite etc, or have an ID.
    self.log(teamcityWrite("testSuiteStarted", ["name", "cuke.suite"]));

    //self.log(teamcityWrite("testStarted", ["name", "cuke", "captureStandardOutput", "false"]));

    var parentHear = self.hear;
    self.hear = function hear(event, callback) {
        statsJournal.hear(event, function () {
            parentHear(event, callback);
        });
    };

    self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {

        self.logScenarios();
        //self.logFailedScenariosResults();
    
        var buildFailed = statsJournal.witnessedAnyFailedStep();

        if (buildFailed) {
            self.log(teamcityWrite("buildProblem", ["description", "The build failed because one or more steps in one or more scenarios faild."]));
            self.log(teamcityWrite("testSuiteFinished", ["name", "cuke.suite"]));
            callback();
        } else {
            self.log(teamcityWrite("testSuiteFinished", ["name", "cuke.suite"]));
            callback();
        }
    };



    self.logScenarios = function logScenarios() {
        var scenarioCount = statsJournal.getScenarioCount();
        var passedScenarioCount = statsJournal.getPassedScenarioCount();
        var undefinedScenarioCount = statsJournal.getUndefinedScenarioCount();
        var pendingScenarioCount = statsJournal.getPendingScenarioCount();
        var failedScenarioCount = statsJournal.getFailedScenarioCount();

        self.log(teamcityWrite("buildStatisticValue", ["key", "scenarios", "value", scenarioCount]));
        self.log(teamcityWrite("buildStatisticValue", ["key", "passedScenarios", "value", passedScenarioCount]));
        self.log(teamcityWrite("buildStatisticValue", ["key", "undefinedScenarios", "value", undefinedScenarioCount]));
        self.log(teamcityWrite("buildStatisticValue", ["key", "pendingScenarios", "value", pendingScenarioCount]));
        self.log(teamcityWrite("buildStatisticValue", ["key", "faildScenarios", "value", failedScenarioCount]));
    };


    self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
        var scenario = event.getPayloadItem('scenario');
        var name = scenario.getName();
        var uri = scenario.getUri();
        var line = scenario.getLine();
        var message = "Test failed at line " + line + " in " + uri;



        self.log(teamcityWrite("testStarted", ["name",name]));

        if (statsJournal.isCurrentScenarioFailing()) {
            self.log(teamcityWrite("testFailed", ["name", name, "message", message]));
        } else {
            self.log(teamcityWrite("testStdOut", ["name",name,"out", "URI: " + uri])); 
        }
        self.log(teamcityWrite("testFinished", ["name", name]));
        
        callback();
    };

    return self;
};
module.exports                             = TeamcityFormatter;





