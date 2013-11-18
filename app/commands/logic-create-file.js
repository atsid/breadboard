function create (context, callback) {

    console.log("create file called");
    console.log(JSON.stringify(context));

    var file = require("./util/file"),
        uuid = require("node-uuid"),
        coll,
        self,
        cname,
        root = app.get("dataPath"),
        path;

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

    var id = uuid.v4();

    var filename = path + "/" + id;

    context.entity._id = context.params.uri + "/" + id;
    context.entity.uri = context.entity._id;

    console.log("saving new object at [" + filename + "]", context.entity);

    file.forceWriteJSONFile(filename, context.entity, function (err, result) {
        context.result = result;
        callback(context);
    });

};
