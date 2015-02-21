'use strict';

exports.start = function (config) {

    console.log("Working dir: " + process.cwd());
    var express = require('express'),
        fs = require('fs'),
        http = require('http'),
        path = require('path'),
        aop = require('./hateoas-aop'),
        endpoints = require('./hateoas-endpoints'),
        schemaService = require('./schema-service'),
        configLoader = require('./config-loader'),
        app = express();

    aop.configure(config);

    configLoader.load(app, config);

    app.set('port', process.env.PORT || app.get('port') || 3000);

    app.use(express.bodyParser());

    endpoints(app).scan(function () {
        app.use('/application', aop.addContext);
        app.use('/application', aop.before);
        app.use('/application', aop.process);
        app.use('/application', aop.after);
        app.use('/application', aop.filter);
        app.use('/application', aop.final);

        //default command set
        app.use('/commands', express.static(__dirname + '/commands'));

        //app-instance-specific schema set
        app.use('/' + app.get('app.name'), express.static(__dirname + app.get('app.path')));

        //default dev client
        app.use(express.static(__dirname + app.get('client.path')));


    });

    schemaService(app, {
        middleware: [express.bodyParser()],
        path: app.get('app.path')
    });

    http.createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });

};
