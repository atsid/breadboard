"use strict";

var linkUtil = require("./links");

/**
 * This function finds what table/collection an object should be a part of,
 * by finding it's "collection" or "self" link and parsing off the schema name.
 *
 * The idea behind this is that the schema definitions themselves provide enough information that
 * a storage convention can be derived for automatic persistence.
 *
 * First is checks for a "collection" link indicating the collection the object instance is a part of.
 * If that doesn't exist, it checks for the "self" link, as we're retrieving an entire collection.
 *
 * Note that this assumes the schema attached to the link has not been resolved, as we look for $ref.
 * @param links
 */
exports.collection = function (links) {

    var coll = linkUtil.find(links, "schema/rel/collection"),
        self = linkUtil.find(links, "schema/rel/self"),
        link = coll || self,
        name = link.schema.$ref.substring(link.schema.$ref.lastIndexOf("/") + 1);

    return name;
};