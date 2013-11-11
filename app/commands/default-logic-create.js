/**
 * Created with JetBrains WebStorm.
 * User: kevin.convy
 * Date: 11/11/13
 * Time: 11:40 AM
 * To change this template use File | Settings | File Templates.
 */

function create (context, callback) {

    var mongodb = require("mongodb"),
        dbstring = "mongodb://test:mongotest@paulo.mongohq.com:10045/dysxI4lRS8s1qBCj5pzDUw";

    mongodb.MongoClient.connect(dbstring, function (err, db) {
        var c
            ,self
            ,coll
            ,id = new mongodb.BSONPure.ObjectID()
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
        context.entity._id = context.params.uri + "/" + id;
        c.insert(context.entity, function (err, doc) {
            context.result = doc;
            console.log("Created in collection: " + cname + " :" + JSON.stringify("result: " +  context.result));
            callback(context)
        });
    });
};