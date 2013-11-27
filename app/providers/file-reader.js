"use strict";

var file = require("../util/file");

function makeFilename(args) {

    var collection = args.collection,
        id = args.id,
        app = args.app,
        root = app.get("fileDataPath"),
        path = root + collection,
        filename = path;

    if (id) {
        filename += id;
    }

    console.log("making filename collection [" + collection + "] id [ " + id + "]");
    console.log(filename);
    return filename;

}

exports.readOne = function (args, callback) {
    var filename = makeFilename(args);
    console.log("reading file " + filename);
    file.readJSONFile(filename, function (err, file) {
        callback(err, file);
    });
};

exports.readList = function (args, callback) {
    var path = makeFilename(args);
    console.log("reading from path " + path);
    file.forceReadJSONDirectory(path, function (err, files) {
        callback(err, files);
    });
};

exports.create = function (args, callback) {

    var uuid = require("node-uuid"),
        uri = args.uri,
        id = uuid.v4(),
        data = args.data;

    data._id = uri + "/" + id;
    data.uri = data._id;
    args.id = "/" + id; //TODO: fix this - other modules that are using substring get the leading slash

    var filename = makeFilename(args);
    console.log("creating file " + filename);
    file.forceWriteJSONFile(filename, data, function (err, file) {
        callback(file);
    });
};

exports.update = function (args, callback) {
    var filename = makeFilename(args);
    console.log("updating file " + filename);
    file.forceWriteJSONFile(filename, args.data, function (err, file) {
        callback(file);
    });
};

exports.remove = function (args, callback) {
    var filename = makeFilename(args);
    file.deleteJSONFile(filename, function (err) {
        callback(err);
    });
};
