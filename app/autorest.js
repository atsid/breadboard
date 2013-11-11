var fs = require("fs")
    , vm = require('vm');

module.exports = function (app, config) {
    var scan = function () {
        var dirs = fs.readdir("schema/models", function (err, files) {
            if (err) throw err;

            files.forEach(function (file) {
                console.log("Scanning file " + file);
                model = require("./schema/models/" + file);

                if (model.links) {
                    model.links.forEach(function (link) {
                        var linkHref = link.href.replace("{", ":").replace("}", "");

                        console.log("Found " + link.rel + " with method " + link.method + " with url " + linkHref);

                        if ("GET" === link.method) {
                            app.get("/" + linkHref, config.middleware, function (req, res, next) {
                                req.params.uri = req.path;
                                var context = {params: req.params, links: model.links, entity: req.body, results: {}}, handlerScript = fs.readFileSync("commands/default-logic-read.js", "UTF-8"),
                                    getHandler = eval("(function() {return " + handlerScript + "})()");
                                console.log(handlerScript);
                                getHandler(context, function () {
                                    res.send(context.result);
                                });
                            });
                        }

                        if ("PUT" === link.method) {
                            app.put("/" + linkHref, config.middleware, function (req, res, next) {
                                req.params.uri = req.path;
                                var context = {params: req.params, links: model.links, entity: req.body, results: {}}, handlerScript = fs.readFileSync("commands/default-logic-update.js", "UTF-8"),
                                    putHandler = eval("(function() {return " + handlerScript + "})()");

                                putHandler(context, function () {
                                    res.send(context.result);
                                });
                            });
                        }

                        if ("POST" === link.method) {
                            app.post("/" + linkHref, config.middleware, function (req, res, next) {
                                req.params.uri = req.path;
                                var context = {params: req.params, links: model.links, entity: req.body, results: {}}, handlerScript = fs.readFileSync("commands/default-logic-create.js", "UTF-8"),
                                    postHandler = eval("(function() {return " + handlerScript + "})()");

                                postHandler(context, function () {
                                    res.send(context.result);
                                });
                            });
                        }

                        if ("DELETE" == link.method) {
                            app.delete("/" + linkHref, config.middleware, function (req, res, next) {
                                req.params.uri = req.path;
                                var context = {params: req.params, links: model.links, entity: req.body, results: {}}, handlerScript = fs.readFileSync("commands/default-logic-delete.js", "UTF-8"),
                                    deleteHandler = eval("(function() {return " + handlerScript + "})()");

                                deleteHandler(context, function () {
                                    res.send(context.result);
                                });
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