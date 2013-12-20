"use strict";
exports.execute = function (ctx, callback) {
    console.log("Called after-command with ctx: " + JSON.stringify(ctx));
    callback();
};
