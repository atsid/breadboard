"use strict";

var fs = require("fs"),
    clone = require("clone");

function expandUri(uri, params) {
    if (uri) {
        Object.keys(params).forEach(function (param) {
            uri = uri.replace("{" + param + "}", params[param]);
        });
    }
    return uri;
}
/**
 * Read model files and create endpoints as needed by the model links
 * and relationships.
 * @param files - the collection of files to process.
 * @param app - the express app to attach endpoints to.
 */
exports.processModelFiles = function (files, app) {

    console.log("Processing models " + JSON.stringify(files));

    var appPath = app.get("app.path"),
        targetPath,
        method,
        targetHandler,
        list = {};

    //
    // Build the map of handler functions using captured schemas, links and relationships.
    //
    files.forEach(function (file) {

        console.log("Scanning file " + file);

        var model = JSON.parse(fs.readFileSync(appPath + "/schema/models/" + file));

        if (model.links) {

            model.links.forEach(function (link) {

                var linkHref = link.href.replace(/\{/g, ":").replace(/\}/g, ""),
                    rel = link.rel,
                    schemaModel = JSON.parse(fs.readFileSync(appPath + "/" + link.schema.$ref + ".json")),
                    linkMethod = link.method || "GET",
                    target,
                    handlerFunc = function (req, res, next) {
                        //always clone the reference materials so templates aren't ruined by later expansions
                        req.params.uri = expandUri(req.path, req.params);
                        req._hateoasLink = clone(link);
                        req._schema = clone(schemaModel);
                        req._result = req.body;
                        next();
                    };
                target = "/" + linkHref;
                list[target] = list[target] || {};
                list[target][linkMethod] = list[target][linkMethod] || {};
                list[target][linkMethod][rel] = list[target][linkMethod][rel] || handlerFunc;
                console.log("created : " + target + " " + linkMethod + " " + rel);
            });
        }
    });

    //
    // The main endpoint handler that determines the link
    // handler to process
    //
    targetHandler = function (req, res, next) {

        // given the target/method/rel, this will find the correct handler.
        // however, we don't always have a rel accompanying the request,
        // so this will compensate by finding the first target/method match if needed
        //it also tries to default to a self link if a handler exists
        function findHandler(t, m, r) {
            var possible = list[t][m];
            if (r) {
                console.log("rel exists [" + r + "], using handler");
            } else {
                if (possible["schema/rel/self"]) {
                    r = "schema/rel/self";
                    console.log("no rel, but self exists, so using that");
                } else {
                    r = Object.keys(possible)[0];
                    console.log("using first available rel [" + r + "] handler");
                }

            }
            return possible[r];
        }

        //TODO: search possible pragma for exact rel key
        var pragma = req.headers.pragma, handler,
            rel = pragma && pragma.split("=")[1];
        console.log("==========");
        console.log("Invoking target: " + req.method + " | " + req.path);
        console.log("route: " + JSON.stringify(req.route));
        console.log("rel: " + rel);
        handler = findHandler(req.route.path, req.method, rel);

        try {
            handler(req, res, next);
        } catch (e) {
            console.log("error: " + e);
            res.status(500);
        }
    };

    for (targetPath in list) {
        for (method in list[targetPath]) {
            app[method.toLowerCase()](targetPath, targetHandler);
        }
    }

    console.log("setup total endpoints " + Object.keys(list).length);
    console.log(JSON.stringify(list, null, 2));
};