"use strict";
//handful of utilities to reduce test boilerplate and bootstrap config
var request = require("request"),
    fs = require("fs"),
    config = JSON.parse(fs.readFileSync(__dirname + '/../appconfig.json'));

/**
 * Wraps up a request, using localhost and the configured app port, and parsing JSON automatically.
 * @param path
 * @param callback - should have the same signature as request.callback (error, response, body), but the body will be already parsed (https://github.com/mikeal/request)
 */
exports.request = function (path, callback) {
    request("http://localhost:" + config.port + path, function (error, response, body) {
        try {
            var json = JSON.parse(body);
            callback(error, response, json);
        } catch (e) {
            console.log(body);
            callback(e);
        }
    });

};