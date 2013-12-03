"use strict";

/**
 * Basic update logic for an object.
 * @param context
 * @param app
 * @param callback
 */
exports.execute = function (context, app, callback) {

    var provider = require(app.get("dataProvider")),
        links = require("../util/links"),
        persist = require("../util/persist"),
        inList = links.inList(context.links),
        cname = persist.collection(context.links),
        uri = context.params.uri,
        id = uri.substring(uri.lastIndexOf("/"), uri.length),
        args = {
            data: context.entity,
            collection: cname,
            id: id,
            app: app
        };

    if (inList) {
        provider.update(args, function (err, file) {
            context.result = file;
            callback(context);
        });
    } else {
        throw new Error("Attempting to [update] entire collection");
    }

};
