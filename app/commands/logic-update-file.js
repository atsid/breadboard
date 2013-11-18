function create (context, callback) {

    console.log("update file called");
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

    console.log("object storage is in " + path);

    filename = path + id;

    console.log("saving edited object at [" + filename + "]", context.entity);

    file.forceWriteJSONFile(filename, context.entity, function (err, result) {
        context.result = result;
        callback(context);
    });

};
