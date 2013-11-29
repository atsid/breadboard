"use strict";

/**
 * Finds a specific link object within a collection by looking for a rel match.
 * For example, finding the "self" link within the links on an object.
 * @param links
 * @param rel
 * @returns {*}
 */
exports.find = function (links, rel) {
    var result;
    links.some(function (link) {
        if (link.rel === rel) {
            result = link;
            return true;
        }
    });
    return result;
};

/**
 * Determines from the links array whether an object instance is within a list.
 * This is done by checking for a "collection" link.
 * @param links
 */
exports.inList = function (links) {
    var result = false;
    links.some(function (link) {
        var rel = link.rel,
            slash = rel.lastIndexOf("/"),
            coll = rel.substring(slash + 1, rel.length);
        if (coll === "collection") {
            result = true;
            return true;
        }
    });
    return result;
};