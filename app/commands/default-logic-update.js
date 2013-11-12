function update (context, callback) {

    /**
     * Default update operation for the object of interest, with no other business logic.
     * It updates the object within mongodb.
     * In order to determine what table (collection) to use, it looks first for the "collection"
     * link, which defines that collection an item is within. If this link is not present,
     * we are dealing with an actual collection, in which case the "self" link is used.
     */

    var mongodb = require("mongodb"),
        dbstring = "mongodb://test:mongotest@paulo.mongohq.com:10045/dysxI4lRS8s1qBCj5pzDUw";

    mongodb.MongoClient.connect(dbstring, function (err, db) {
        var c
            ,self
            ,coll
            ,cname
        ;
        context.links.forEach(function (link) {
            if (link.rel === "schema/rel/collection") {
                coll = link.schema['$ref'].substring(link.schema['$ref'].lastIndexOf("/")+1);
            } else if (link.rel === "schema/rel/self") {
                self = link.schema['$ref'].substring(link.schema['$ref'].lastIndexOf("/")+1);
            }
        });
        cname = coll || self || "Application";
        c = db.collection(cname);
        c.insert(context.entity, function (err, doc) {
            context.result = doc;
            console.log("Updating to collection: " + cname + " : " + JSON.stringify(context.result));
            callback(context)
        });
    });
};