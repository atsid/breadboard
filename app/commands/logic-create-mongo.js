function create (context, callback) {

    /**
     * Default delete operation for the object of interest, with no other business logic.
     * It adds the object to mongodb.
     * In order to determine what table (collection) to use, it looks first for the "collection"
     * link, which defines that collection an item is within. If this link is not present,
     * we are dealing with an actual collection, in which case the "self" link is used.
     */

    var mongodb = require("mongodb"),
        dbstring = app.get("mongodb.connect");

    mongodb.MongoClient.connect(dbstring, function (err, db) {
        var c,
            self,
            coll,
            id = new mongodb.BSONPure.ObjectID(),
            cname;

        context.links.forEach(function (link) {
            if (link.rel === "schema/rel/collection") {
                coll = link.schema['$ref'].substring(link.schema['$ref'].lastIndexOf("/")+1);
            } else if (link.rel === "schema/rel/self") {
                self = link.schema['$ref'].substring(link.schema['$ref'].lastIndexOf("/")+1);
            }
        });
        cname = coll || self;

        c = db.collection(cname);
        context.entity._id = context.params.uri + "/" + id;
        context.entity.uri = context.entity._id;
        c.insert(context.entity, function (err, docs) {
            context.result = docs[0];
            console.log("Created in collection: " + cname + " :" + JSON.stringify("result: " +  context.result));
            db.close();
            callback(context)
        });

    });
};