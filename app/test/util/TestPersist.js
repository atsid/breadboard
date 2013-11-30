"use strict";

var assert = require("assert"),
    persist = require("../../util/persist");

describe("util/persist", function () {

    describe("#collection()", function () {

        var data = [{
            "rel": "self"
        }, {
            "rel": "collection",
            "schema": {
                "$ref": "schema/models/UserList"
            }
        }];

        it("should return 'schema.id' from the 'collection' link", function () {
            var result = persist.collection(data);
            assert.strictEqual(result, "UserList");
        });

    });

});