/*
 * This is a simple breadboard instantiation for dev purposes, which uses the restbucks sample app.
 */
var config = require('./samples/restbucks/appconfig.json'),
    breadboard = require('./app/main');

breadboard.start(config);
