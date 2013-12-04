"use strict";

var http = require("http"),
    linkFilter = require("./links");

exports.processModelFiles = function (files, app, config) {

    var appPath = config.path,
        endpointMapping = {
            "GET": { appFunc: app.get.bind(app), responseCode: 200, processor: config.middleware, defaultCommand: app.get("defaults.logic.get") },
            "PUT": { appFunc: app.put.bind(app), responseCode: 200, processor: config.middleware, defaultCommand: app.get("defaults.logic.put") },
            "POST": { appFunc: app.post.bind(app), responseCode: 201, processor: config.middleware, defaultCommand: app.get("defaults.logic.post") },
            "DELETE": { appFunc: app.delete.bind(app), responseCode: 204, processor: config.noparse, defaultCommand: app.get("defaults.logic.delete")}
        },
        list = {};

    files.forEach(function (file) {

        console.log("Scanning file " + file);

        var model = require(appPath + "/schema/models/" + file);

        if (model.links) {

            model.links.forEach(function (link) {

                var linkHref = link.href.replace(/\{/g, ":").replace(/\}/g, ""),
                    schemaModel = require(appPath + "/" + link.schema.$ref + ".json"),
                    target,
                    endpoint,
                    handlerFunc = function (defaultHandlerPath, req, res) {

                        req.params.uri = linkFilter.expandHref(req.path, req.params);

                        var context = {params: req.params, model: schemaModel, links: schemaModel.links, entity: req.body, results: {}},
                            commandFilename = link.logic ? "./" + link.logic.command : defaultHandlerPath,
                            handler = require(commandFilename);

                        handler.execute(context, app, function () {

                                function linksDone(links) {

                                    console.log("finished iterating links, response ready");
                                    var response = {
                                        data: context.result,
                                        links: links
                                    };

                                    res.send(response);
                                }

                                //figure out which links belong on this response
                                linkFilter.filter(schemaModel, context, app, config, linksDone);

                            }
                        );

                    };

                console.log("Found " + link.rel + " with method " + link.method + " with url " + linkHref);

                if (endpointMapping[link.method]) {

                    endpoint = endpointMapping[link.method];

                    console.log("Creating endpoint " + link.method + " @ " + linkHref + " with command " + endpoint.defaultCommand);
                    target = "/" + linkHref;

                    //we can get dups among the links of course, so ignore if they've already been setup
                    if (!list[target]) {
                        list[target] = true;

                        endpoint.appFunc(target, endpoint.processor, function (req, res, next) {

                            console.log("Target " + target);
                            console.log("Executing " + link.method + " on " + req.path + " with command " + endpoint.defaultCommand);
                            console.log("Params: " + JSON.stringify(req.params, null, 2));

                            try {
                                handlerFunc(endpoint.defaultCommand, req, res);
                                res.status(endpoint.responseCode);
                            } catch (e) {
                                console.log("error: " + e);
                                res.status(500);
                            }

                        });

                    }

                }

            });
        }
    });

    console.log("setup total endpoints " + Object.keys(list).length);
    console.log(JSON.stringify(list, null, 2));
};