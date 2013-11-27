"use strict";

var fs = require('fs');

module.exports = function (app, config) {
    app.get('/schema/models/:model', config.middleware, function (req, res, next) {
        res.status(200).sendfile("schema/models/" + req.params.model + ".json");
    });
    app.get('/schema/rel/:rel', config.middleware, function (req, res, next) {
        res.status(200).sendfile("schema/rel/" + req.params.rel + ".txt");
    });
    app.get('/schema/rql/:rql', config.middleware, function (req, res, next) {
        res.status(200).sendfile("schema/rql/" + req.params.rql + ".rql");
    });
};