"use strict";

var async = require("async"),
    http = require("http"),
    links = require("./links");

module.exports = {
    // executes an http get for every arg and pushes it into the args map
    loadArguments: function (context, args, callback) {
        var argValues = {}, functionList = {};


        Object.keys(args).forEach(function (arg) {
            var argUri = links.expandHref(args[arg], context.params);

            functionList[arg] = function (callback) {
                http.get("http://localhost:3000/" + argUri, function (argResponse) {
                    argResponse.on('data', function (dataResponse) {
                        if (argResponse.headers['content-type'].match(/^application\/json/)) {
                            argValues[arg] = JSON.parse("" + dataResponse);
                        } else {
                            argValues[arg] = dataResponse;
                        }
                        callback(null, dataResponse);
                    });
                });
            };
        });

        async.series(functionList, function (err, results) {
            callback();
        });

        return argValues;
    }
};