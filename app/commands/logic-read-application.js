"use strict";

/**
 * Special logic for reading the Application object, as we only want one to exist.
 * @param context
 * @param app
 * @param callback
 */
exports.execute = function (context, callback) {

    var provider = require(context.config.dataProvider);

    provider.readList({
        config: context.config,
        collection: "Application"
    }, function (err, items) {
        context.result = items[0] || null;
        if (context.result) {
            context.result.uri = "/application"; //TODO: kludge to override weird replacement
        }
        callback(context);
    });

};
