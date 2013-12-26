"use strict";

var file = require("../util/file");

function makeFilename(args) {

    var collection = args.collection,
        id = args.id,
        root = args.config.filedb.path,
        path = root + collection,
        filename = path;

    if (id) {
        filename += id;
    }

    return filename;

}

exports.readOne = function (args, callback) {
    var filename = makeFilename(args);
    file.readJSONFile(filename, function (err, file) {
        callback(err, file);
    });
};

exports.readList = function (args, callback) {
    var path = makeFilename(args);
    file.forceReadJSONDirectory(path, function (err, files) {
        callback(err, files);
    });
};

exports.create = function (args, callback) {

    var uuid = require("node-uuid"),
        uri = args.uri,
        id = uuid.v4(),
        data = args.data,
        filename;

    data._id = id;
    data.uri = uri + "/" + id;
    args.id = "/" + id; //TODO: fix this - other modules that are using substring get the leading slash

    filename = makeFilename(args);
    file.forceWriteJSONFile(filename, data, function (err, content) {
        callback(err, data);
    });
};

exports.update = function (args, callback) {
    var filename = makeFilename(args);
    file.forceWriteJSONFile(filename, args.data, function (err, content) {
        callback(err, args.data);
    });
};

exports.remove = function (args, callback) {
    var filename = makeFilename(args);
    file.deleteJSONFile(filename, function (err) {
        callback(err);
    });
};
