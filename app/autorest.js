var fs = require("fs"),
    http = require("http"),
    async = require("async"),
    argLoader = require("./arg-loader.js"),
    clone = require("clone");

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

                                                var context = {params: req.params, model: schemaModel, links: schemaModel.links, entity: req.body, results: {}}, handlerScript = (link.logic && link.logic.command) ? fs.readFileSync(link.logic.command + ".js", "UTF-8") : fs.readFileSync(defaultHandlerPath, "UTF-8"),
                                                    handler = eval("(function() {return " + handlerScript + "})()");

                                                handler(context, function () {

                                                        console.log("executing handler with params");
                                                        Object.keys(context.params).forEach(function (param) {
                                                            console.log(param + " : " + context.params[param]);
                                                        });
                                                        var outputLinks = [], schemaLinkFunctions = [],
                                                            linkFunction = function (instanceLink, schemaCallback) {

                                                                console.log("checking the links to determine if they should be added " + instanceLink.rel);

                                                                var linkFilter = instanceLink.filter,
                                                                    linkFilterCommand = linkFilter && linkFilter.command ? linkFilter.command : "./commands/default-filter-include",
                                                                    linkFilterArguments = linkFilter && linkFilter.arguments ? linkFilter.arguments : {},
                                                                    linkHandlerScript = fs.readFileSync(linkFilterCommand + ".js", "UTF-8"),
                                                                    linkFilterHandler = eval("(function() {return " + linkHandlerScript + "})()"),
                                                                    linkExpander = function linkHrefExpander(uri, params) {
                                                                        if (uri) {
                                                                            Object.keys(params).forEach(function (param) {
                                                                                console.log("Replacing {" + param + "} with " + params[param]);
                                                                                uri = uri.replace("{" + param + "}", params[param]);
                                                                            });
                                                                        }
                                                                        return uri;
                                                                    };

                                                                var selfUri = context.result ? (context.result.uri || req.path) : "";
                                                                if (context.result) {
                                                                    console.log("result uri:" + context.result.uri);
                                                                }
                                                                console.log("path: " + req.path);

                                                                var argValues = argLoader.loadArguments(context, linkExpander, linkFilterArguments, function () {
                                                                    linkFilterHandler({
                                                                        params: context.params,
                                                                        link: instanceLink,
                                                                        entity: context.entity,
                                                                        result: context.result,
                                                                        args: argValues
                                                                    }, function (linkToKeep) {
                                                                        if (linkToKeep) {
                                                                            var href = instanceLink.href[0] === "/" ? instanceLink.href : "/" + instanceLink.href;
                                                                            var len = req.path;
                                                                            href = req.path + href.substring(req.path.length);
                                                                            console.log("----------------------");
                                                                            console.log("req.path: " + req.path);
                                                                            console.log("href: " + instanceLink.href);
                                                                            console.log("Rel: " + linkToKeep.rel);
                                                                            console.log("New href: " + href);
                                                                            linkToKeep.href = instanceLink.rel === "schema/rel/self" ? selfUri : linkExpander(linkToKeep.href, context.params);
                                                                            outputLinks.push(linkToKeep);
                                                                        }
                                                                    });
                                                                    schemaCallback(null);
                                                                })
                                                            }

                                                        schemaModel.links.forEach(function (schemaLink) {
                                                            schemaLinkFunctions.push(function (schemaCallback) {
                                                                // Make sure we use a clone of the schema model so we don't modify the original!!!
                                                                linkFunction(clone(schemaLink), schemaCallback);
                                                            });
                                                        });

                                                        async.series(schemaLinkFunctions, function () {
                                                            console.log("finished iterating links")
                                                            var response = {
                                                                data: context.result,
                                                                links: outputLinks
                                                            };

                                                            res.send(response);
                                                        });
                                                    }
                                                );

                                            },
                                            endpointMapping = {
                                                "GET": { appFunc: app.get.bind(app), responseCode: 200, processor: config.middleware, defaultCommand: "commands/default-logic-read.js" },
                                                "PUT": { appFunc: app.put.bind(app), responseCode: 200, processor: config.middleware, defaultCommand: "commands/default-logic-update.js" },
                                                "POST": { appFunc: app.post.bind(app), responseCode: 201, processor: config.middleware, defaultCommand: "commands/default-logic-create.js" },
                                                "DELETE": { appFunc: app.delete.bind(app), responseCode: 204, processor: config.noparse, defaultCommand: "commands/default-logic-delete.js"}};

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
                                )
                                ;
                            }
                        }
                    )
                    ;
                }
            )
            ;
    };

    return {
        scan: scan
    }
}