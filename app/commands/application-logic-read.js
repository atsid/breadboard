function read(context, callback) {
    var mongodb = require("mongodb"),
        dbstring = "mongodb://test:mongotest@paulo.mongohq.com:10045/dysxI4lRS8s1qBCj5pzDUw";

    mongodb.MongoClient.connect(dbstring, function (err, db) {
        var c
            , self
            , coll
            , cname = "application"
            ;
        cname = coll || self || "Application";
        c = db.collection(cname);
        c.findOne({ }, function (err, doc) {
            context.result = doc;
            console.log("Reading from collection: " + cname + " : " + JSON.stringify(context.result));
            callback(context)
        });
    });
};