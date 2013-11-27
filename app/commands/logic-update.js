"use strict";

exports.execute = function (context, app, callback) {

    console.log("update file called");
    console.log(JSON.stringify(context));

    var provider = require(app.get("dataProvider")),
        links = require("../util/links"),
        //all this logic is to determine if it is one or a list based on link options. TODO: extract
        //this could be done instead by looking at the schema itself instead of checking for collection/self links
        coll = links.find(context.links, "schema/rel/collection"),
        self = links.find(context.links, "schema/rel/self"),
        link = coll || self,
        cname = link.schema.$ref.substring(link.schema.$ref.lastIndexOf("/") + 1),
        uri = context.params.uri,
        id = uri.substring(uri.lastIndexOf("/"), uri.length),
        args = {
            data: context.entity,
            collection: cname,
            id: id,
            app: app
        };

    if (coll) {
        provider.update(args, function (err, file) {
            context.result = file;
            callback(context);
        });
    } else {
        throw new Error("Attempting to [update] entire collection");
    }

};
