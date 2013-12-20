"use strict";

/**
 * Basic delete logic for an object.
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
            collection: cname,
            uri: uri,
            id: id
        };

    //if it is an item in a collection, read one, otherwise read the directory
    if (inList) {
        provider.remove(args, function (err) {
            context.result = null; //??
            callback(context);
        });
    } else {
        throw new Error("Attempting to [delete] entire collection");
    }
};
