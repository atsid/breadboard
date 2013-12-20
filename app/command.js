"use strict";

var async = require("async"),
    config = require("./appconfig.json"),
    request = require("request"),
    argLoader = require("./args");

exports.execute = function (link, req, host, callback) {

    var commandDef = link.command && (link.command.indexOf("http") < 0 ? "http://" + host + "/" + link.command : link.command),
        commandArgs = link && link.arguments ? link.arguments : {};

    if (commandDef) {
        request(commandDef, function (err, response, body) {

            var result = body,
            /*jslint evil: true */
                mod = eval("(function(){var exports = {}; " + result + " return exports;})()");

            argLoader.load(commandArgs, host, function (args) {
                console.log("Loaded args: " + JSON.stringify(commandArgs) + " for command " + JSON.stringify(commandDef));
                var ctx = {
                    config: config,
                    params: req.params,
                    link: link,
                    links: req._schema.links,
                    entity: req._result,
                    args: args,
                    result: req._result
                };
                mod.execute(ctx, function () {
                    req._result = ctx.result;
                    req._links = ctx.links;
                    callback();
                });
            });
        });
    } else {
        callback();
    }
};