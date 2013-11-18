exports.execute = function (context, app, callback) {

    /**
     * This is a special command to load the application. There can be only one (highlander!),
     * so we've written this special command to ensure it exists if it doesn't.
     */

    var mongodb = require("mongodb"),
        dbstring = app.get("mongodb.connect");

    mongodb.MongoClient.connect(dbstring, function (err, db) {
        var c,
            cname = "Application";

        c = db.collection(cname);
        c.findOne({ }, function (err, doc) {
            context.result = doc;
            db.close();
            console.log("Reading from collection: " + cname + " : " + JSON.stringify(context.result));
            callback(context)
        });
    });
};