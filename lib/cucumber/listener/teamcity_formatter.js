var ConsoleColor = require('../util/colors');
var teamcityWrite = require("./teamcity/format_for_teamcity.js");

var TeamcityFormatter = function(options) {
  var Cucumber = require('../../cucumber');
  if (!options)
    options = {};

  var failedScenarioLogBuffer = "";
  var statsJournal = Cucumber.Listener.StatsJournal();
  var self             = Cucumber.Listener.Formatter(options);
  
    //Write start of test to teamcity. Could also be test suite etc, or have an ID.
    self.log(teamcityWrite("testStarted", ["name", "cuke", "captureStandardOutput", "true"]));


  var parentHear = self.hear;
  self.hear = function hear(event, callback) {
      statsJournal.hear(event, function () {
      parentHear(event, callback);
    });
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {

    self.logSteps();
    self.logScenarios();
    //self.logFailedScenariosResults();
    
    var testFailed = statsJournal.witnessedAnyFailedStep();

    if (testFailed) {
        self.log(teamcityWrite("testFailed", ["name", "cuke", "description","Test failed."]));
        //self.log(teamcityWrite("buildProblem", ["description", "The build failed because one or more steps in one or more scenarios faild."]));
        self.log(teamcityWrite("testFinished", ["name", "cuke"]));
        callback();
    } else {
        self.log(teamcityWrite("testFinished", ["name", "cuke"]));
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
      if (statsJournal.isCurrentScenarioFailing()) {
          var scenario = event.getPayloadItem('scenario');
          self.storeFailedScenario(scenario);
      }
      callback();
  };

  self.storeFailedScenario = function storeFailedScenario(failedScenario) {
      var name = failedScenario.getName();
      var uri = failedScenario.getUri();
      var line = failedScenario.getLine();
      self.logFailedScenario(uri + ":" + line + " # Scenario: " + name);
  };

  self.logFailedScenario = function logFailedScenario(string) {
      self.log(teamcityWrite("buildProblem", ["description", "scenario failed", "identity", string]));
  };

  self.getFailedScenarioLogBuffer = function getFailedScenarioLogBuffer() {
      return failedScenarioLogBuffer;
  };

  self.logFailedScenariosResults = function logFailedScenariosResults() {
      //keep if we want to send artifacts to teamcity      
  };

  return self;
};
module.exports                             = TeamcityFormatter;





