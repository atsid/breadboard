function remove (context, callback) {

    console.log("delete file called");
    console.log(JSON.stringify(context));

    var file = require("./util/file"),
        coll,
        self,
        cname,
        root = app.get("dataPath"),
        path,
        uri = context.params.uri,
        id = uri.substring(uri.lastIndexOf("/"), uri.length),
        filename;

    context.links.forEach(function (link) {
        if (link.rel === "schema/rel/collection") {
            coll = link.schema['$ref'].substring(link.schema['$ref'].lastIndexOf("/")+1);
        } else if (link.rel === "schema/rel/self") {
            self = link.schema['$ref'].substring(link.schema['$ref'].lastIndexOf("/")+1);
        }
    });

    cname = coll || self;

    path = root + cname;

    //if it is an item in a collection, read one, otherwise read the directory
    if (coll) {
        filename = path + id;
        file.deleteJSONFile(filename, function (err) {
            callback(context);
        });
    } else {
        throw new Error("deleting of collections not yet supported");
    }

};
