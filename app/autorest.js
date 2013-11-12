var fs = require("fs");

module.exports = function (app, config) {
    var scan = function () {
        var dirs = fs.readdir("schema/models", function (err, files) {
            if (err) throw err;

            files.forEach(function (file) {
                console.log("Scanning file " + file);
                var model = require("./schema/models/" + file);

                if (model.links) {

                    model.links.forEach(function (link) {

                        var linkHref = link.href.replace("{", ":").replace("}", ""),
                            schemaModel = require("./" + link.schema['$ref'] + ".json"),
                            handlerFunc = function (defaultHandlerPath, req, res) {

                                req.params.uri = req.path;

                                var context = {params: req.params, model: schemaModel, links: schemaModel.links, entity: req.body, results: {}}, handlerScript = (link.logic && link.logic.command) ? fs.readFileSync(link.logic.command + ".js", "UTF-8") : fs.readFileSync(defaultHandlerPath, "UTF-8"),
                                    handler = eval("(function() {return " + handlerScript + "})()");

                                handler(context, function () {

                                    var outputLinks = [];

                                    schemaModel.links.forEach(function (instanceLink) {

                                        console.log("checking the links to determine if they should be added " + instanceLink.rel);

                                        var linkFilterCommand = (instanceLink.filter && instanceLink.filter.command) ? instanceLink.filter.command : "./commands/default-filter-include",
                                            linkHandlerScript = fs.readFileSync(linkFilterCommand + ".js", "UTF-8"),
                                            linkFilterHandler = eval("(function() {return " + linkHandlerScript + "})()");

                                        linkFilterHandler({
                                            params: context.params,
                                            link: instanceLink,
                                            entity: context.entity,
                                            result: context.result
                                        }, function (linkToKeep) {
                                            if (linkToKeep) {
                                                outputLinks.push(linkToKeep);
                                            }
                                        });

                                    });

                                    var response = {
                                        item: context.result,
                                        links: outputLinks
                                    };

                                    res.send(response);

                                });

                            },
                            endpointMapping = {
                                "GET": { appFunc: app.get.bind(app), defaultCommand: "commands/default-logic-read.js" },
                                "PUT": { appFunc: app.put.bind(app), defaultCommand: "commands/default-logic-update.js" },
                                "POST": { appFunc: app.post.bind(app), defaultCommand: "commands/default-logic-create.js" },
                                "DELETE": { appFunc: app.delete.bind(app), defaultCommand: "commands/default-logic-delete.js"}};

                        console.log("Found " + link.rel + " with method " + link.method + " with url " + linkHref);

                        if (endpointMapping[link.method]) {
                            var endpoint = endpointMapping[link.method];

                            console.log("Creating endpoint " + link.method + " using " + endpoint.appFunc + " with command " + endpoint.defaultCommand);

                            endpoint.appFunc("/" + linkHref, config.middleware, function (req, res, next) {
                                console.log("Executing " + link.method + " on " + req.path + " with command " + endpoint.defaultCommand);
                                handlerFunc(endpoint.defaultCommand, req, res);
                            });
                        }
                    });
                }
            });
        });
    };

    return {
        scan: scan
    }
}