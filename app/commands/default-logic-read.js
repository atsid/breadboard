/**
 * Created with JetBrains WebStorm.
 * User: kevin.convy
 * Date: 11/11/13
 * Time: 11:40 AM
 * To change this template use File | Settings | File Templates.
 */

function read (context, callback) {

    var mongodb = require("mongodb"),
        dbstring = "mongodb://127.0.0.1:27017/test";

    mongodb.MongoClient.connect(dbstring, function (err, db) {
        var c
            ,self
            ,coll
            ,cname = "application"
        ;
        context.links.forEach(function (link) {
            if (link.rel === "schema/rel/collection") {
                coll = link.schema.substring(link.schema.lastIndexOf("/")+1);
            } else if (link.rel === "schema/rel/self") {
                self = link.schema.substring(link.schema.lastIndexOf("/")+1);
            }
        });
        cname = coll || self || "application";
        c = db.collection(cname);
        c.findOne({_id: context.params.uri}, function (err, doc) {
            context.result = doc;
            console.log("Reading from collection: " + cname + " : " + JSON.stringify(context.result));
            callback(context)
        });
    });
};