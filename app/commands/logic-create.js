"use strict";

/**
 * Basic create logic for an object.
 * We use the links to determine which collection to store under, then delegate to the persistence provider.
 * @param context
 * @param app
 * @param callback
 */
exports.execute = function (context, callback) {

    var provider = require(context.config.dataProvider),
        links = require("./util/links"),
        persist = require("./util/persist"),
        cname = persist.collection(context.links),
        uri = context.params.uri,
        args = {
            config: context.config,
            data: context.entity,
            uri: uri,
            collection: cname
        };

    provider.create(args, function (err, item) {
        context.result = item;
        callback(context);
    });

};
