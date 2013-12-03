"use strict";

var fs = require("fs"),
    schema = require("./schema");

module.exports = function (app, config) {

    var scan = function () {

        fs.readdir(config.path + "/schema/models", function (err, files) {

            if (err) {
                throw err;
            }

            schema.processModelFiles(files, app, config);

        });
    };

    return {
        scan: scan
    };

};