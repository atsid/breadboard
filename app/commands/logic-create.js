"use strict";

/**
 * Basic create logic for an object.
 * We use the links to determine which collection to store under, then delegate to the persistence provider.
 * @param context
 * @param app
 * @param callback
 */
exports.execute = function (context, app, callback) {

    var provider = require(app.get("dataProvider")),
        links = require("../util/links"),
        persist = require("../util/persist"),
        cname = persist.collection(context.links),
        uri = context.params.uri,
        args = {
            data: context.entity,
            uri: uri,
            collection: cname,
            app: app
        };

    provider.create(args, function (err, item) {
        context.result = item;
        callback(context);
    });

};
