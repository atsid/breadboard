"use strict";

var assert = require("assert"),
    helpers = require("../helpers");

describe("UserList HTTP requests", function () {

    describe("/application/users", function () {

        var output;

        before(function (done) {
            helpers.request("/application/users", function (error, response, json) {
                output = {
                    response: response,
                    json: json
                };
                done();
            });
        });

        it("users GET request should return `200`", function (done) {
            assert.equal(output.response.statusCode, 200);
            done();
        });

        it("should return a non-empty list of users", function (done) {
            assert.equal(output.json.data.items.length > 0, true);
            done();
        });

        it("users list should have `4` links", function (done) {
            assert.equal(output.json.links.length, 4);
            done();
        });

        it("result objects should have no 'private' members ('_' prefix)", function (done) {
            var has_ = false;
            output.json.data.items.forEach(function (item) {
                Object.keys(item).forEach(function (key) {
                    if (key.indexOf("_") === 0) {
                        has_ = true;
                    }
                });
            });
            assert.equal(has_, false);
            done();
        });

    });

});