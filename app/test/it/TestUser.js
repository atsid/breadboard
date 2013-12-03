"use strict";

var assert = require("assert"),
    helpers = require("../helpers");

describe("User HTTP requests", function () {

    var user;

    before(function (done) {
        helpers.request("/application/users", function (error, response, json) {
            //just grab the first user, and request him immediately
            helpers.request(json.data.items[0].uri, function (error, response, json) {
                user = {
                    response: response,
                    json: json
                };
                done();
            });
        });
    });

    describe("/application/users/<user>", function () {

        it("user GET request should return `200`", function (done) {
            assert.equal(user.response.statusCode, 200);
            done();
        });

        it("user should have a role of `customer|barista`", function (done) {
            assert.equal(user.json.data.role === "customer" || user.json.data.role === "barista", true);
            done();
        });

        it("user should have `6` links", function (done) {
            assert.equal(user.json.links.length, 6);
            done();
        });

    });

});