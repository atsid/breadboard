//lets load newrelic - if we have it
if (process.env.license) {
    require('newrelic');
}

/**
 * Simple express app to serve tutorial pages and services.
 */
var express = require('express')
    , http = require('http')
    , path = require('path')
    , autorest = require('./autorest')
    , schemaService = require('./schema-service');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname));

//restsmd(app, {
//    mongoInstance: "mongodb://cloudbees:dba69a3b8d21d8f16c1393935dbab7bf@alex.mongohq.com:10018/BYe5thvosvLkf8H88k10Tg",
////    mongoInstance: "mongodb://localhost",
//    modelDir: "./schema/models/mongoose",
//    appDir: process.cwd() + '/'
//});
autorest(app, {
    middleware: [express.bodyParser()]
}).scan();

schemaService(app, {
    middleware: [express.bodyParser()]
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
