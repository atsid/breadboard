var fs = require("fs"),
    http = require("http"),
    async = require("async"),
    argLoader = require("./arg-loader.js"),
    clone = require("clone"),
    scriptLoader = require("./script-loader.js"),
    links = require("./links");

module.exports = function (app, config) {
    var scan = function () {
        var dirs = fs.readdir("schema/models", function (err, files) {
                if (err) throw err;

                files.forEach(function (file) {
                        console.log("Scanning file " + file);
                        var model = require("./schema/models/" + file);

                        if (model.links) {

                            model.links.forEach(function (link) {

                                    var linkHref = link.href.replace(/\{/g, ":").replace(/\}/g, ""),
                                        schemaModel = require("./" + link.schema['$ref'] + ".json"),
                                        handlerFunc = function (defaultHandlerPath, req, res) {

                                            req.params.uri = req.path;

                                            var context = {params: req.params, model: schemaModel, links: schemaModel.links, entity: req.body, results: {}},
                                                handler = scriptLoader(link.logic, defaultHandlerPath, "command");

                                            handler(context, function () {
                                                    links.filter(context, req, argLoader, schemaModel, function (filterResponse) {
                                                        res.send(filterResponse);
                                                    });
                                                }
                                            );
                                        },
                                        endpointMapping = {
                                            "GET": { appFunc: app.get.bind(app), responseCode: 200, processor: config.middleware, defaultCommand: "commands/default-logic-read" },
                                            "PUT": { appFunc: app.put.bind(app), responseCode: 200, processor: config.middleware, defaultCommand: "commands/default-logic-update" },
                                            "POST": { appFunc: app.post.bind(app), responseCode: 201, processor: config.middleware, defaultCommand: "commands/default-logic-create" },
                                            "DELETE": { appFunc: app.delete.bind(app), responseCode: 204, processor: config.noparse, defaultCommand: "commands/default-logic-delete"}};

                                    console.log("Found " + link.rel + " with method " + link.method + " with url " + linkHref);

                                    if (endpointMapping[link.method]) {
                                        var endpoint = endpointMapping[link.method];

                                        console.log("Creating endpoint " + link.method + " using " + endpoint.appFunc + " with command " + endpoint.defaultCommand);

                                        endpoint.appFunc("/" + linkHref, endpoint.processor, function (req, res, next) {
                                            console.log("Executing " + link.method + " on " + req.path + " with command " + endpoint.defaultCommand);

                                            handlerFunc(endpoint.defaultCommand, req, res);
                                            res.status(endpoint.responseCode);
                                        });
                                    }
                                }
                            );
                        }
                    }
                );
            }
        );
    };

    return {
        scan: scan
    }
}