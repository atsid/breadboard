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
    autorest = require('./autorest'),
    schemaService = require('./schema-service'),
    configLoader = require('./config-loader');

var app = express();

configLoader.load(app, "./appconfig.json");

app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname));

autorest(app, {
    middleware: [express.bodyParser()],
    noparse: []
}).scan();

schemaService(app, {
    middleware: [express.bodyParser()]
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});