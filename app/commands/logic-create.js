"use strict";

exports.execute = function (context, app, callback) {

    console.log("create file called");
    console.log(JSON.stringify(context));

    var provider = require(app.get("dataProvider")),
        links = require("../util/links"),
        persist = require("../util/persist"),
        inList = links.inList(context.links),
        cname = persist.collection(context.links),
        uri = context.params.uri,
        args = {
            data: context.entity,
            uri: uri,
            collection: cname,
            app: app
        };

    if (inList) {
        provider.create(args, function (err, file) {
            context.result = file;
            callback(context);
        });
    } else {
        throw new Error("Attempting to [create] entire collection");
    }

};
