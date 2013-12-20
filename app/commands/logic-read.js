"use strict";

/**
 * Basic read logic for an object or collection.
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
            uri: uri,
            collection: cname
        };

    //if it is an item in a collection, read one, otherwise read the directory
    if (inList) {
        args.id = id;
        provider.readOne(args, function (err, item) {
            context.result = item;
            callback(context);
        });
    } else {
        provider.readList(args, function (err, items) {
            context.result = {
                items: items
            };
            callback(context);
        });
    }

};
