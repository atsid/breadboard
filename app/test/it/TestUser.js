"use strict";

var assert = require("assert"),
    helpers = require("../helpers"),
    links = require("../../util/links");

describe("User HTTP requests", function () {

    this.timeout(10000);

    var output;

    before(function (done) {
        helpers.request("/application/users", function (error, response, json) {
            //just grab the first user, and request him immediately
            helpers.request(json.data.items[0].uri, function (error, response, json) {
                output = {
                    response: response,
                    json: json
                };
                done();
            });
        });
    });

    describe("/application/users/<user>", function () {

        function findLink(rel) {
            return links.find(output.json.links, rel);
        }

        it("user GET request should return `200`", function (done) {
            assert.equal(output.response.statusCode, 200);
            done();
        });

        it("user should have a role of `customer|barista`", function (done) {
            assert.equal(output.json.data.role === "customer" || output.json.data.role === "barista", true);
            done();
        });

        it("user should have `6` links", function (done) {
            assert.equal(output.json.links.length, 6);
            done();
        });

        describe("user.links", function () {

            it("user `self` link href should match `user.uri`", function (done) {
                //TODO: this isn't quite right because for persistence we prepend a slash
                var link = findLink("self");
                assert.equal(link.href, output.json.data.uri.substring(1, output.json.data.uri.length));
                done();
            });

            it("user `collection` link href should match `application/users`", function (done) {
                var link = findLink("collection");
                assert.equal(link.href, "application/users");
                done();
            });

            it("user `products` link href should match `user.uri` + `/products`", function (done) {
                var link = findLink("products");
                assert.equal("/" + link.href, output.json.data.uri + "/products");
                done();
            });

            it("user `orders` link href should match `user.uri` + `/orders`", function (done) {
                var link = findLink("orders");
                assert.equal("/" + link.href, output.json.data.uri + "/orders");
                done();
            });

            it("user `edit` link href should match `user.uri`", function (done) {
                var link = findLink("edit");
                assert.equal("/" + link.href, output.json.data.uri);
                done();
            });

            it("user `remove` link href should match `user.uri`", function (done) {
                var link = findLink("remove");
                assert.equal("/" + link.href, output.json.data.uri);
                done();
            });

        });

    });

});