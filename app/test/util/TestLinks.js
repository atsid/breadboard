"use strict";

var assert = require("assert"),
    links = require("../../util/links");

describe("util/links", function () {

    describe("#find()", function () {

        var data = [{
            "rel": "self"
        }, {
            "rel": "collection"
        }];

        it("should return `undefined` when a link with matching rel is not present", function () {
            var result = links.find(data, "parent");
            assert.strictEqual(typeof result, "undefined");
        });

        it("should return the `link` when a link with matching rel is present", function () {
            var result = links.find(data, "self");
            assert.strictEqual(result.rel, "self");
        });

    });

    describe("#inList()", function () {

        //this is going to test multiple forms of the link, to ensure our regex match works
        var data1 = [{
            "rel": "self"
        }, {
            "rel": "collection"
        }],
        data2 = [{
            "rel": "schema/rel/self"
        }, {
            "rel": "schema/rel/collection"
        }];

        it("should return `true` when a 'collection' rel is present", function () {
            var result = links.inList(data1);
            assert.strictEqual(result, true);
        });

        it("should return `true` when a '**/collection' rel is present", function () {
            var result = links.inList(data2);
            assert.strictEqual(result, true);
        });

    });

});