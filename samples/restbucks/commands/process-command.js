"use strict";
exports.execute = function (ctx, callback) {
    console.log("Called process-command with ctx: " + JSON.stringify(ctx));
    callback();
};
