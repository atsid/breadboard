"use strict";
//handful of utilities to reduce test boilerplate and bootstrap config
var request = require("request"),
    fs = require("fs");

/**
 * Wraps up a request, using localhost and the configured app port, and parsing JSON automatically.
 * @param path - relative path of request (not including host:port). Note that port is set to 3000 based on assumption that IT tests are targeted at restbucks sample app.
 * @param callback - should have the same signature as request.callback (error, response, body), but the body will be already parsed (https://github.com/mikeal/request)
 */
exports.request = function (path, rel, callback) {
    var opts = {
        url: "http://localhost:3000" + path
    };
    typeof (rel) === 'function' ? callback = rel : "";
    if (rel && typeof (rel) !== "function") {
        opts.headers = {
            "Pragma": "hateoas-rel=" + rel
        };
    }
    request(opts, function (error, response, body) {
        try {
            var json = JSON.parse(body);
            callback(error, response, json);
        } catch (e) {
            console.log(body);
            callback(e);
        }
    });

};