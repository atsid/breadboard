"use strict";

var assert = require("assert"),
    helpers = require("../helpers"),
    async = require("async");

/**
 * The intent of this test is to iterate the links of the application recusively,
 * exercising every possible GET request that is exposed to ensure that we are allowed to view it.
 * If we aren't, it shouldn't be on the links in the first place.
 */
describe("All HTTP GET requests", function () {

    this.timeout(10000);

    var queue = ["/application/users"],
        gotten = {}; //don't request them twice

    //let's init the queue by starting with the application users list, and picking a user
    //all other requests effectively depend on picking a user up front, so this is sort of a bootstrap
    //TODO: if we include "item" links on collections and do the replacement using one of the item's uri fields, we could start at /application without a before block
    before(function (done) {
        helpers.request(queue[0], function (error, response, json) {
            //just grab the first user
            queue.push(json.data.items[0].uri);
            done();
        });
    });

    function get(url, callback) {
        //console.log("GET " + url);
        gotten[url] = true; //put something in BEFORE we request, so we don't end up piling up dups while in-flight
        helpers.request(url, function (error, response, json) {
            if (error) {
                console.error(error);
            }

            gotten[url] = response.statusCode;

            callback(json);
        });
    }

    function fillQueue(links) {
        links.forEach(function (link) {
            var href = link.href;
            if (href.substr(0, 1) !== "/") {
                href = "/" + href;
            }
            if (link.method === "GET" && !gotten[href]) {

                queue.push(href);
            }
        });
    }

    //recursively empty the queue. each response has links that we'll use to re-fill it, and empty again as long as needed
    function emptyQueue(callback) {

        var functions = [], href;

        function make(href) {
            return function (callback) {
                get(href, function (json) {
                    fillQueue(json.links);
                    callback();
                });
            };
        }

        while (queue.length > 0) {
            href = queue.shift();
            functions.push(make(href));
        }

        async.series(functions, function (results) {
            if (queue.length > 0) {
                emptyQueue(callback);
            } else {
                callback();
            }
        });

    }

    it("descend links and assert count (5) and response codes (200)", function (done) {

        emptyQueue(function () {
            //console.log(JSON.stringify(gotten));
            var keys = Object.keys(gotten);
            //TODO: this'll be more once we re-add the "item" rel type
            assert.equal(5, keys.length);
            keys.forEach(function (key) {
                assert.equal(200, gotten[key]);
            });
            done();
        });

    });


});