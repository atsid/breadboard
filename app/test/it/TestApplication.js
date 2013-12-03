"use strict";

var assert = require("assert"),
    helpers = require("../helpers");

describe("Application HTTP requests", function () {

    describe("/application", function () {

        var application;

        before(function (done) {
            helpers.request("/application", function (error, response, json) {
                application = {
                    response: response,
                    json: json
                };
                done();
            });
        });

        it("application GET request should return `200`", function (done) {
            assert.equal(application.response.statusCode, 200);
            done();
        });

        it("root application URI should be `/application`", function (done) {
            assert.equal(application.json.data.uri, "/application");
            done();
        });

        it("application should have `3` links", function (done) {
            assert.equal(application.json.links.length, 3);
            done();
        });

    });

});