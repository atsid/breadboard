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

app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname));

autorest(app, {
    middleware: [express.bodyParser()]
}).scan();

schemaService(app, {
    middleware: [express.bodyParser()]
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
