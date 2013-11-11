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
                                var context = {params: req.params, link: link, entity: req.body, results: {}}, handlerScript = fs.readFileSync("commands/doget.js", "UTF-8"),
                                    getHandler = eval("(function() {return " + handlerScript + "})()");

                                getHandler(context, function () {
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