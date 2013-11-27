"use strict";

var Mongo = require("mongodb"),
    MongoClient = Mongo.MongoClient;

exports.readOne = function (args, callback) {
    var dbstring = args.app.get("mongodb.connect");
    MongoClient.connect(dbstring, function (err, db) {
        db.collection(args.collection)
            .findOne({_id: args.uri}, function (err, doc) {
                console.log("Mongodb Provider readOne found: " + JSON.stringify(doc) + "looking for: " + args.uri);
                callback(err, doc);
                db.close();
            });
    });
};

exports.readList = function (args, callback) {
    var dbstring = args.app.get("mongodb.connect");
    MongoClient.connect(dbstring, function (err, db) {
        db.collection(args.collection)
            .find({}).toArray(function (err, doc) {
                console.log("Mongodb Provider Found collection: " + doc);
                callback(err, doc);
                db.close();
            });
    });
};

exports.create = function (args, callback) {
    var dbstring = args.app.get("mongodb.connect");
    MongoClient.connect(dbstring, function (err, db) {
        var c = db.collection(args.collection);
        args.data._id = args.uri + "/" + new Mongo.BSONPure.ObjectID();
        args.data.uri = args.data._id;
        c.insert(args.data, function (err, docs) {
            console.log("Mongodb Provider created item: " + docs[0]._id);
            callback(err, docs);
            db.close();
        });
    });
};

exports.update = function (args, callback) {
    var dbstring = args.app.get("mongodb.connect");
    MongoClient.connect(dbstring, function (err, db) {
        var c = db.collection(args.collection);
        console.log("trying to update to collection: " + args.collection + " : " + JSON.stringify(args.data));
        c.update({_id: args.data._id || args.data.uri}, args.data, function (err, doc) {
            callback(err, doc);
            db.close();
            console.log("Updating to collection: " + args.collection + " : " + JSON.stringify(doc));
        });
    });
};

exports.remove = function (args, callback) {
    var dbstring = args.app.get("mongodb.connect");
    MongoClient.connect(dbstring, function (err, db) {
        var c = db.collection(args.collection);
        c.remove({_id: args.uri}, function (err, count) {
            db.close();
            console.log("Removing (x) items from collection: " + args.collection + " : " + count);
            console.log("Tried to remove: " + args.uri);
            callback(err);
        });
    });
};
