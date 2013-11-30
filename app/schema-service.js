"use strict";

var fs = require('fs');

module.exports = function (app, config) {

    var schemaPath = config.path + "/schema";

    app.get('/schema/models/:model', config.middleware, function (req, res, next) {
        var filename = schemaPath + "/models/" + req.params.model + ".json";
        fs.readFile(filename, function (err, content) {
            res.json(200, content);
        });
    });

    app.get('/schema/rel/:rel', config.middleware, function (req, res, next) {
        var filename = schemaPath + "/rel/" + req.params.rel + ".txt";
        fs.readFile(filename, function (err, content) {
            res.set("Content-Type", "text/plain");
            res.send(200, content);
        });
    });

    app.get('/schema/rql/:rql', config.middleware, function (req, res, next) {
        var filename = schemaPath + "/rql/" + req.params.model + ".rql";
        fs.readFile(filename, function (err, content) {
            res.set("Content-Type", "text/plain");
            res.send(200, content);
        });
    });

};