"use strict";

var assert = require("assert"),
    helpers = require("../helpers");

describe("UserList HTTP requests", function () {

    describe("/application/users", function () {

        var users;

        before(function (done) {
            helpers.request("/application/users", function (error, response, json) {
                users = {
                    response: response,
                    json: json
                };
                done();
            });
        });

        it("users GET request should return `200`", function (done) {
            assert.equal(users.response.statusCode, 200);
            done();
        });

        it("should return a non-empty list of users", function (done) {
            assert.equal(users.json.data.items.length > 0, true);
            done();
        });

        it("users list should have `4` links", function (done) {
            assert.equal(users.json.links.length, 4);
            done();
        });

    });

});