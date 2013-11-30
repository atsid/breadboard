"use strict";

/**
 * Basic read logic for an object or collection.
 * @param context
 * @param app
 * @param callback
 */
exports.execute = function (context, app, callback) {

    console.log("read file called");
    console.log(JSON.stringify(context));

    var provider = require(app.get("dataProvider")),
        links = require("../util/links"),
        persist = require("../util/persist"),
        inList = links.inList(context.links),
        cname = persist.collection(context.links),
        uri = context.params.uri,
        id = uri.substring(uri.lastIndexOf("/"), uri.length),
        args = {
            uri: uri,
            collection: cname,
            app: app
        };

    //if it is an item in a collection, read one, otherwise read the directory
    if (inList) {
        args.id = id;
        provider.readOne(args, function (err, file) {
            context.result = file;
            callback(context);
        });
    } else {
        provider.readList(args, function (err, files) {
            context.result = {
                items: files
            };
            callback(context);
        });
    }

};
