'use strict';

exports.start = function (configFile) {

    process.chdir('./app');

    var config = require(configFile),
        express = require('express'),
        fs = require('fs'),
        http = require('http'),
        path = require('path'),
        hateoasAOP = require('./hateoas-aop'),
        autorest = require('./hateoas-endpoints'),
        schemaService = require('./schema-service'),
        configLoader = require('./config-loader'),
        app = express();

    hateoasAOP.configure(config);

    configLoader.load(app, config);

    app.set('port', process.env.PORT || app.get('port') || 3000);

    app.use(express.bodyParser());

    autorest(app).scan(function () {
        app.use('/application', hateoasAOP.addContext);
        app.use('/application', hateoasAOP.before);
        app.use('/application', hateoasAOP.process);
        app.use('/application', hateoasAOP.after);
        app.use('/application', hateoasAOP.filter);
        app.use('/application', hateoasAOP.final);
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
