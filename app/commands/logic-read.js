exports.execute = function (context, app, callback) {

    console.log("read file called");
    console.log(JSON.stringify(context));

    var provider = require(app.get("dataProvider")),
        links = require("../util/links"),
        //all this logic is to determine if it is one or a list based on link options. TODO: extract
        //this could be done instead by looking at the schema itself instead of checking for collection/self links
        coll = links.find(context.links, "schema/rel/collection"),
        self = links.find(context.links, "schema/rel/self"),
        link = coll || self,
        cname = link.schema['$ref'].substring(link.schema['$ref'].lastIndexOf("/")+1),
        uri = context.params.uri,
        id = uri.substring(uri.lastIndexOf("/"), uri.length),
        args = {
            collection: cname,
            app: app
        };

    //if it is an item in a collection, read one, otherwise read the directory
    if (coll) {
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
