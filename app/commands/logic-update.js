"use strict";

/**
 * Basic update logic for an object.
 * @param context
 * @param app
 * @param callback
 */
exports.execute = function (context, callback) {

    var provider = require(context.config.dataProvider),
        links = require("./util/links"),
        persist = require("./util/persist"),
        inList = links.inList(context.links),
        cname = persist.collection(context.links),
        uri = context.params.uri,
        id = uri.substring(uri.lastIndexOf("/"), uri.length),
        args = {
            config: context.config,
            data: context.entity,
            collection: cname,
            id: id
        };

    if (inList) {
        provider.update(args, function (err, item) {
            context.result = item;
            callback(context);
        });
    } else {
        throw new Error("Attempting to [update] entire collection");
    }

};
