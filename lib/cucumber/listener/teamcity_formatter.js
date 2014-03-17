var ConsoleColor = require('../util/colors');
var teamcityWrite = require("./format_for_teamcity.js");

var TeamcityFormatter = function(options) {
  var Cucumber = require('../../cucumber');
  if (!options)
    options = {};

  var self             = Cucumber.Listener.Formatter(options);
  var summaryFormatter = Cucumber.Listener.SummaryFormatter({
    coffeeScriptSnippets: options.coffeeScriptSnippets,
    logToConsole: false
  });

    //Write start of test to teamcity. Could also be test suite etc, or have an ID.
  self.log(teamcityWrite("testStarted", ["name", "cuke", "captureStandardOutput", "true"]));


  var parentHear = self.hear;
  self.hear = function hear(event, callback) {
    summaryFormatter.hear(event, function () {
      parentHear(event, callback);
    });
  };

  self.handleStepResultEvent = function handleStepResult(event, callback) {
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
    self.log(TeamcityFormatter.PASSED_STEP_CHARACTER);
  };

  self.handlePendingStepResult = function handlePendingStepResult() {
    self.log(TeamcityFormatter.PENDING_STEP_CHARACTER);
  };

  self.handleSkippedStepResult = function handleSkippedStepResult() {
    self.log(TeamcityFormatter.SKIPPED_STEP_CHARACTER);
  };

  self.handleUndefinedStepResult = function handleUndefinedStepResult() {
    self.log(TeamcityFormatter.UNDEFINED_STEP_CHARACTER);
  };

  self.handleFailedStepResult = function handleFailedStepResult() {
    self.log(TeamcityFormatter.FAILED_STEP_CHARACTER);
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    var summaryLogs = summaryFormatter.getLogs();
    self.log("\n\n");
    //self.log(summaryLogs);
    self.log(teamcityWrite("testFinished", ["name", "cuke"]));
    callback();
  };

  return self;
};
TeamcityFormatter.PASSED_STEP_CHARACTER    = ConsoleColor.format('passed', teamcityWrite("message",["stepprogress","passed"]));
TeamcityFormatter.SKIPPED_STEP_CHARACTER   = ConsoleColor.format('skipped', teamcityWrite("message",["stepprogress","skipped"]));
TeamcityFormatter.UNDEFINED_STEP_CHARACTER = ConsoleColor.format('undefined', teamcityWrite("message", ["stepprogress","undefined"]));
TeamcityFormatter.PENDING_STEP_CHARACTER   = ConsoleColor.format('pending', teamcityWrite("message",["stepprogress","pending"]));
TeamcityFormatter.FAILED_STEP_CHARACTER    = ConsoleColor.format('failed', teamcityWrite("message",["stepprogress","failed"]));
module.exports                             = TeamcityFormatter;
