var ConsoleColor = require('../util/colors');
var teamcityWrite = require("./format_for_teamcity.js");

var TeamcityFormatter = function(options) {
  var Cucumber = require('../../cucumber');
  if (!options)
    options = {};

  var statsJournal = Cucumber.Listener.StatsJournal();
  var self             = Cucumber.Listener.Formatter(options);
  
    //Write start of test to teamcity. Could also be test suite etc, or have an ID.
    self.log(teamcityWrite("testStarted", ["name", "cuke", "captureStandardOutput", "true"]));
  

//............................

  var parentHear = self.hear;
  self.hear = function hear(event, callback) {
      statsJournal.hear(event, function () {
      parentHear(event, callback);
    });
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {


    self.logSteps();
    self.logScenarios();


    var testFailed = statsJournal.witnessedAnyFailedStep();
    //console.log("Did test fail? " + testFailed);
    if (testFailed) {
        self.log(teamcityWrite("buildProblem", ["description", "The build failed because one or more steps in one or more scenarios faild."]));
        self.log(teamcityWrite("testFinished", ["name", "cuke"]));
    } else {
        self.log(teamcityWrite("testFinished", ["name", "cuke"]));
    }

    callback();
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
  }




  return self;
};


    


module.exports                             = TeamcityFormatter;





