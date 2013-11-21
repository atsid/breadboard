var fs = require("fs"),
    http = require("http"),
    async = require("async");

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
                                                    commandFilename = link.logic ? "./" + link.logic.command : defaultHandlerPath;
                                                    handler = require(commandFilename);

                                                handler.execute(context, app, function () {

                                                        console.log("executing handler with params");
                                                        Object.keys(context.params).forEach(function (param) {
                                                            console.log(param + " : " + context.params[param]);
                                                        });
                                                        var outputLinks = [], schemaLinkFunctions = [],
                                                            linkFunction = function (instanceLink, schemaCallback) {

                                                                console.log("checking the links to determine if they should be added " + instanceLink.rel);

                                                                var linkFilter = instanceLink.filter,
                                                                    linkFilterCommand = linkFilter ? "./" + linkFilter.command : "./commands/default-filter-include",
                                                                    linkFilterArguments = linkFilter && linkFilter.arguments ? linkFilter.arguments : {},
//                                                                    linkHandlerScript = fs.readFileSync(linkFilterCommand + ".js", "UTF-8"),
//                                                                    linkFilterHandler = eval("(function() {return " + linkHandlerScript + "})()");
                                                                    linkFilterHandler = require(linkFilterCommand);

                                                                function linkHrefExpander(uri, params) {
                                                                    if (uri) {
                                                                        Object.keys(params).forEach(function (param) {
                                                                            uri = uri.replace("{" + param + "}", params[param]);
                                                                        });
                                                                    }
                                                                    return uri;
                                                                }

                                                                //executes an http get for every arg and pushes it into the args map
                                                                function retrieveLinkFilterArguments(args, filterCallback) {
                                                                    var argValues = {}, functionList = {}, i = 0;

                                                                    console.log("retrieving link filter args");

                                                                    Object.keys(args).forEach(function (arg) {
                                                                        var argUri = linkHrefExpander(args[arg], context.params);
                                                                        console.log("\tlooking up arg [" + arg + "] @ " + argUri);

                                                                        functionList[arg] = function (callback) {
                                                                            console.log("Request[" + i + "] callback for " + argUri);
                                                                            http.get("http://localhost:3000/" + argUri, function (res2) {
                                                                                res2.on('data', function (res3) {
                                                                                    console.log("Response[" + i + "]: " + typeof res3);
                                                                                    res3 = ("" + res3).replace(/null/g, '""').replace(/\n/g, "").replace(/\"\{/g, "{").replace(/\}\"/g, "}").replace(/\\\"/g, '"');
                                                                                    console.log("------------RESPONSE--------------");
                                                                                    console.log(res3);
                                                                                    console.log("-------- END RESPONSE-------------");
                                                                                    console.log("type: " + typeof res2.headers['content-type']);
                                                                                    console.log("value: " + res2.headers['content-type']);
                                                                                    if (res2.headers['content-type'].match(/^application\/json/)) {
                                                                                        argValues[arg] = JSON.parse("" + res3);
                                                                                    } else {
                                                                                        argValues[arg] = res3;
                                                                                    }
                                                                                    callback(null, res3);
                                                                                });
                                                                            });
                                                                        };

                                                                        i = i + 1;
                                                                    });

                                                                    async.series(functionList, function (err, results) {
                                                                            console.log("-----------------> results: ");
//                                                                            Object.keys(results).forEach(function (key) {
//                                                                                console.log("\tKey: " + key + " " + results[key]);
//                                                                                Object.keys(results[key]).forEach(function (key2) {
//                                                                                    console.log("\t\tKey: " + key2 + " " + results[key][key2]);
//                                                                                });
//                                                                            });

                                                                            filterCallback();
                                                                        }
                                                                    );
                                                                    return argValues;
                                                                }

                                                                var selfUri = context.result ? (context.result.uri || req.path) : "";
                                                                if (context.result) {
                                                                    console.log("result uri:" + context.result.uri);
                                                                }
                                                                console.log("path: " + req.path);

                                                                var argValues = retrieveLinkFilterArguments(linkFilterArguments, function () {
                                                                    linkFilterHandler.execute({
                                                                        params: context.params,
                                                                        link: instanceLink,
                                                                        entity: context.entity,
                                                                        result: context.result,
                                                                        args: argValues
                                                                    },
                                                                    app,
                                                                    function (linkToKeep) {
                                                                        if (linkToKeep) {
                                                                            var href = instanceLink.href;
                                                                            var len = req.path;
                                                                            href = req.path + "/" + href.substring(req.path.length);
                                                                            console.log("new href: " + href);
                                                                            linkToKeep.href = instanceLink.rel === "schema/rel/self" ? selfUri : linkHrefExpander(linkToKeep.href, context.params);
                                                                            outputLinks.push(linkToKeep);
                                                                        }
                                                                    });
                                                                    schemaCallback(null);
                                                                })
                                                            }

                                                        schemaModel.links.forEach(function (schemaLink) {
                                                            schemaLinkFunctions.push(function (schemaCallback) {
                                                                linkFunction(schemaLink, schemaCallback);
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
                                                "GET": { appFunc: app.get.bind(app), responseCode: 200, processor: config.middleware, defaultCommand: app.get("defaults.logic.get") },
                                                "PUT": { appFunc: app.put.bind(app), responseCode: 200, processor: config.middleware, defaultCommand: app.get("defaults.logic.put") },
                                                "POST": { appFunc: app.post.bind(app), responseCode: 201, processor: config.middleware, defaultCommand: app.get("defaults.logic.post") },
                                                "DELETE": { appFunc: app.delete.bind(app), responseCode: 204, processor: config.noparse, defaultCommand: app.get("defaults.logic.delete")}};

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
    };

};