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
    stepCount = statsJournal.getStepCount();
    self.log(teamcityWrite("buildStatisticValue", ["key", "Steps", "value", stepCount]));
    //maybe report build problem here
    var stepResult = event.getPayloadItem('stepResult');
    if (stepResult.isSuccessful())
      self.handleSuccessfulStepResult();
    else if (stepResult.isPending())
      self.handlePendingStepResult();
    else if (stepResult.isSkipped())
      self.handleSkippedStepResult();
    else if (stepResult.isUndefined())
      self.handleUndefinedStepResult();
    else
      self.handleFailedStepResult();
    callback();
  };

  self.handleSuccessfulStepResult = function handleSuccessfulStepResult() {
      //self.log(TeamcityFormatter.PASSED_STEP_CHARACTER);
      passedStepCount = statsJournal.getPassedStepCount();
      self.log(teamcityWrite("buildStatisticValue", ["key", "passedSteps", "value", passedStepCount]));

  };

  self.handlePendingStepResult = function handlePendingStepResult() {
      //self.log(TeamcityFormatter.PENDING_STEP_CHARACTER);
      pendingStepCount = statsJournal.getPendingStepCount();
      self.log(teamcityWrite("buildStatisticValue", ["key", "pendingSteps", "value", pendingStepCount]));
  };

  self.handleSkippedStepResult = function handleSkippedStepResult() {
      //self.log(TeamcityFormatter.SKIPPED_STEP_CHARACTER);
      skippedStepCount = statsJournal.getSkippedStepCount();
      self.log(teamcityWrite("buildStatisticValue", ["key", "skippedSteps", "value", skippedStepCount]));
  };

  self.handleUndefinedStepResult = function handleUndefinedStepResult() {
      //self.log(TeamcityFormatter.UNDEFINED_STEP_CHARACTER);
      undefinedStepCount = statsJournal.getUndefinedStepCount();
      self.log(teamcityWrite("buildStatisticValue", ["key", "undefinedSteps", "value", undefinedStepCount]));
  };

  self.handleFailedStepResult = function handleFailedStepResult() {
      //self.log(TeamcityFormatter.FAILED_STEP_CHARACTER);
      failedStepCount = statsJournal.getFailedStepCount();
      self.log(teamcityWrite("buildStatisticValue", ["key", "failedSteps", "value", failedStepCount]));
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    var testFailed = statsJournal.witnessedAnyFailedStep();
    self.log(teamcityWrite("buildProblem", ["description", "The build failed."]));
    self.log(teamcityWrite("testFinished", ["name", "cuke"]));
    callback();
  };

  return self;
};


TeamcityFormatter.PASSED_STEP_CHARACTER    = teamcityWrite("message",["stepprogress","passed"]);
TeamcityFormatter.SKIPPED_STEP_CHARACTER   = teamcityWrite("message",["stepprogress","skipped"]);
TeamcityFormatter.UNDEFINED_STEP_CHARACTER = teamcityWrite("message", ["stepprogress","undefined"]);
TeamcityFormatter.PENDING_STEP_CHARACTER   = teamcityWrite("message",["stepprogress","pending"]);
TeamcityFormatter.FAILED_STEP_CHARACTER    = teamcityWrite("message",["stepprogress","failed"]);
module.exports                             = TeamcityFormatter;





