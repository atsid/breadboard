var fs = require("fs");

module.exports = function (app, config) {
    var scan = function () {
        var dirs = fs.readdir("schema/models", function (err, files) {
            if (err) throw err;

            files.forEach(function (file) {
                console.log("Scanning file " + file);
                model = require("./schema/models/" + file);

                if (model.links) {
                    model.links.forEach(function (link) {
                        var linkHref = link.href.replace("{", ":").replace("}", ""), handlerFunc = function (defaultHandlerPath, req, res) {
                            req.params.uri = req.path;
                            var context = {params: req.params, links: model.links, entity: req.body, results: {}}, handlerScript = (link.logic && link.logic.command) ? fs.readFileSync(link.logic.command + ".js", "UTF-8") : fs.readFileSync(defaultHandlerPath, "UTF-8"),
                                handler = eval("(function() {return " + handlerScript + "})()");
                            handler(context, function () {
                                res.send(context.result);
                            });
                        };

                        console.log("Found " + link.rel + " with method " + link.method + " with url " + linkHref);

                        if ("GET" === link.method) {
                            app.get("/" + linkHref, config.middleware, function (req, res, next) {
                                handlerFunc("commands/default-logic-read.js", req, res);
                            });
                        }

                        if ("PUT" === link.method) {
                            app.put("/" + linkHref, config.middleware, function (req, res, next) {
                                handlerFunc("commands/default-logic-update.js", req, res);
                            });
                        }

                        if ("POST" === link.method) {
                            app.post("/" + linkHref, config.middleware, function (req, res, next) {
                                handlerFunc("commands/default-logic-create.js", req, res);
                            });
                        }

                        if ("DELETE" == link.method) {
                            app.delete("/" + linkHref, config.middleware, function (req, res, next) {
                                handlerFunc("commands/default-logic-delete.js", req, res);
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