"use strict";

var fs = require("fs"),
    routes = require("./routes");

module.exports = function (app) {

    var scan = function (callback) {

        fs.readdir(app.get("app.path") + "/schema/models", function (err, files) {

            if (err) {
                throw err;
            }

            routes.processModelFiles(files, app);
            callback();

        });
    };

    return {
        scan: scan
    };

};