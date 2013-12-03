"use strict";

var assert = require("assert"),
    helpers = require("../helpers"),
    links = require("../../util/links");

describe("ProductList HTTP requests", function () {

    var output;

    before(function (done) {
        helpers.request("/application/users", function (error, response, json) {
            //just grab the first user, and request his products immediately
            helpers.request(json.data.items[0].uri + "/products", function (error, response, json) {
                output = {
                    response: response,
                    json: json
                };
                done();
            });
        });
    });

    describe("/application/users/<user>/products", function () {

        it("products GET request should return `200`", function (done) {
            assert.equal(output.response.statusCode, 200);
            done();
        });

    });

});