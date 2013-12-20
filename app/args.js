"use strict";

var async = require("async"),
    request = require("request");

/**
 * Asynchronously loads a series of arguments via http.
 * @param args - map of args with key:uri
 * @param callback - callback for results. result should be a map with key:object|text
 */
exports.load = function (args, host, callback) {

    var functions = [],
        results = {};

    Object.keys(args).forEach(function (key) {

        var url = args[key].indexOf("http") < 0 ? "http://" + host + "/" + args[key] : args[key],
            fetch = function (done) {

            request(url, function (err, response, body) {

                var result = body;

                if (response.headers['content-type'].match(/^application\/json/)) {
                    result = JSON.parse(result);
                }

                results[key] = result;
                done(null, result);

            });

        };

        functions.push(fetch);

    });

    async.parallel(functions, function (err, result) {
        callback(results);
    });

};