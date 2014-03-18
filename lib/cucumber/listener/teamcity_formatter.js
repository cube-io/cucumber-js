var ConsoleColor = require('../util/colors');
var teamcityWrite = require("./format_for_teamcity.js");

var TeamcityFormatter = function(options) {
  var Cucumber = require('../../cucumber');
  if (!options)
    options = {};

  var statsJournal = Cucumber.Listener.StatsJournal();
  var self             = Cucumber.Listener.Formatter(options);
  

//.............................
    //Write start of test to teamcity. Could also be test suite etc, or have an ID.
    self.log(teamcityWrite("testStarted", ["name", "cuke", "captureStandardOutput", "true"]));
    var stepCount;
    var passedStepCount;
    var undefinedStepCount;
    var skippedStepCount;
    var pendingStepCount;
    var failedStepCount;




//............................

  var parentHear = self.hear;
  self.hear = function hear(event, callback) {
      statsJournal.hear(event, function () {
      parentHear(event, callback);
    });
  };

  self.handleStepResultEvent = function handleStepResult(event, callback) {
    //stepCount = statsJournal.getStepCount();
    //self.log(teamcityWrite("buildStatisticValue", ["key", "Steps", "value", stepCount]));
    callback();
  };

  self.handleSuccessfulStepResult = function handleSuccessfulStepResult() {
      
      passedStepCount = statsJournal.getPassedStepCount();
      self.log(teamcityWrite("buildStatisticValue", ["key", "passedSteps", "value", passedStepCount]));

  };

  self.handlePendingStepResult = function handlePendingStepResult() {
      
      pendingStepCount = statsJournal.getPendingStepCount();
      self.log(teamcityWrite("buildStatisticValue", ["key", "pendingSteps", "value", pendingStepCount]));
  };

  self.handleSkippedStepResult = function handleSkippedStepResult() {
     
      skippedStepCount = statsJournal.getSkippedStepCount();
      self.log(teamcityWrite("buildStatisticValue", ["key", "skippedSteps", "value", skippedStepCount]));
  };

  self.handleUndefinedStepResult = function handleUndefinedStepResult() {
      
      undefinedStepCount = statsJournal.getUndefinedStepCount();
      self.log(teamcityWrite("buildStatisticValue", ["key", "undefinedSteps", "value", undefinedStepCount]));
  };

  self.handleFailedStepResult = function handleFailedStepResult() {
      
      failedStepCount = statsJournal.getFailedStepCount();
      self.log(teamcityWrite("buildStatisticValue", ["key", "failedSteps", "value", failedStepCount]));
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
      var testFailed = statsJournal.witnessedAnyFailedStep();

      stepCount = statsJournal.getStepCount();
      passedStepCount = statsJournal.getPassedStepCount();
      pendingStepCount = statsJournal.getPendingStepCount();
      skippedStepCount = statsJournal.getSkippedStepCount();
      undefinedStepCount = statsJournal.getUndefinedStepCount();
      failedStepCount = statsJournal.getFailedStepCount();

    self.log(teamcityWrite("buildStatisticValue", ["key", "passedSteps", "value", passedStepCount]));
    self.log(teamcityWrite("buildStatisticValue", ["key", "pendingSteps", "value", pendingStepCount]));
    self.log(teamcityWrite("buildStatisticValue", ["key", "skippedSteps", "value", skippedStepCount]));
    self.log(teamcityWrite("buildStatisticValue", ["key", "undefinedSteps", "value", undefinedStepCount]));
    self.log(teamcityWrite("buildStatisticValue", ["key", "failedSteps", "value", failedStepCount]));
      
    self.log(teamcityWrite("buildStatisticValue", ["key", "Steps", "value", stepCount]));


    self.log(teamcityWrite("buildProblem", ["description", "The build failed."]));
    self.log(teamcityWrite("testFinished", ["name", "cuke"]));
    callback();
  };

  return self;
};



module.exports                             = TeamcityFormatter;





