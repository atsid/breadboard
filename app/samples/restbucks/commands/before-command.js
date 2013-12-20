"use strict";
exports.execute = function (ctx, callback) {
    console.log("Called before-command with ctx: " + JSON.stringify(ctx));
    callback();
};
