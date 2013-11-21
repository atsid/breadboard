/**
 * This file contains utilities for working with the file system,
 * and specifically for handling JSON files that are persisted to disk.
 */
var fs = require("fs");

/**
 * Forces reading of a directory by creating all intermediary directories if needed.
 * Note that generally
 * @param dirname
 * @param callback
 */
exports.forceReadDirectory = function (dirname, callback) {

    exports.ensureDirectoryPathSync(dirname);

    fs.readdir(dirname, function (err, files) {
        callback(err, files);
    });

};

/**
 * Forces reading of a directory and returns the contents as JSON objects.
 * @param dirname
 * @param callback
 */
exports.forceReadJSONDirectory = function (dirname, callback) {

    console.log("forcing JSON read of directory " + dirname);

    exports.forceReadDirectory(dirname, function (err, files) {
        var output = [];
        files.forEach(function (file) {
            var json = JSON.parse(fs.readFileSync(dirname + "/" + file));
            output.push(json);
        });

        callback(null, output);
    });

};

/**
 * Forces reading of a single file and returns as a JSON object.
 * Returns null if it isn't there.
 * @param filename
 * @param callback
 */
exports.readJSONFile = function (filename, callback) {

    console.log("reading file: " + filename);
    fs.readFile(filename, function (err, file) {
        console.log("read file: " + file);
        var json = JSON.parse(file);
        callback(null, json);
    });
};

exports.deleteJSONFile = function (filename, callback) {
    fs.unlink(filename, function (err) {
        callback(err);
    });
};

exports.forceWriteJSONFile = function (filename, obj, callback) {

    var dirname = filename.substring(0, filename.lastIndexOf("/"));
    console.log("writing [" + filename + "] in dir [" + dirname  + "]");
    exports.ensureDirectoryPathSync(dirname);

    fs.writeFile(filename, JSON.stringify(obj, null, 2), { encoding: "utf8" }, function (err) {
        console.log("file written");
        callback(null, obj);
    });

};
/**
 * Ensures directories exist up to the destination file or folder
 * @param  {String} destination Destination file or folder
 */
exports.ensureDirectoryPathSync = function (destination) {
    var index, length, path = "",
        //folder = destination.substring(0, destination.lastIndexOf("/")),
        parts = destination.split("/");

    console.log("ensuring full path exists: " + destination);

    //make sure directory exists all the way down
    for (index = 0, length = parts.length; index < length; index += 1) {
        path += parts[index] + "/"; //TODO: use path.sep
        console.log("forcing directory creation " + path);
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
    }
};