#!/usr/bin/env node
var Cucumber = require('../lib/cucumber');
var cli = Cucumber.Cli(process.argv);
cli.run(function (succeeded) {

    var code = succeeded ? 0 : 1;
    var exitFunction = function () {
        // Always exit with code 0, otherwise posttest script will not be executed.
        // Send message in stderr and exit.
        if (code !== 0) console.error("Test has failed!");
    };

    // --- exit after waiting for all pending output ---
    var waitingIO = false;
    process.stdout.on('drain', function () {
        if (waitingIO) {
            // the kernel buffer is now empty
            exitFunction();
        }
    });
    if (process.stdout.write("")) {
        // no buffer left, exit now:
        exitFunction();
    } else {
        // write() returned false, kernel buffer is not empty yet...
        waitingIO = true;
    }
});
