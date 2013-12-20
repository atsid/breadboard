"use strict";

//lets load newrelic - if we have it
if (process.env.license) {
    require('newrelic');
}

/**
 * Simple express app to serve tutorial pages and services.
 */
var express = require('express'),
    fs = require('fs'),
    http = require('http'),
    path = require('path'),
    hateoasAOP = require('./hateoas-aop'),
    autorest = require('./hateoas-endpoints'),
    schemaService = require('./schema-service'),
    configLoader = require('./config-loader');

var app = express();

configLoader.load(app, "./appconfig.json");

app.set('port', process.env.PORT || app.get("port") || 3000);

app.use(express.bodyParser());
autorest(app).scan(function () {
    app.use("/application", hateoasAOP.addContext);
    app.use("/application", hateoasAOP.before);
    app.use("/application", hateoasAOP.process);
    app.use("/application", hateoasAOP.after);
    app.use("/application", hateoasAOP.filter);
    app.use("/application", hateoasAOP.final);
    app.use(express.static(__dirname + app.get("client.path")));
    app.use("/samples", express.static(__dirname + "/samples/restbucks"));
    app.use("/commands", express.static(__dirname + "/commands"));
});

schemaService(app, {
    middleware: [express.bodyParser()],
    path: app.get("app.path")
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});