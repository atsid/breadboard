"use strict";

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

    var appPath = app.get("app.path"),
        targetPath,
        method,
        defaultHandler = function (req, res, next) {
            req.params.uri = expandUri(req.path, req.params);
            next();
        },
        targetHandler,
        list = {};

    //
    // Build the map of handler functions using captured schemas, links and relationships.
    //
    files.forEach(function (file) {

        console.log("Scanning file " + file);

        var model = require(appPath + "/schema/models/" + file);

        if (model.links) {

            model.links.forEach(function (link) {

                var linkHref = link.href.replace(/\{/g, ":").replace(/\}/g, ""),
                    rel = link.rel,
                    schemaModel = require(appPath + "/" + link.schema.$ref + ".json"),
                    target,
                    endpoint,
                    handlerFunc = function (req, res, next) {
                        req.params.uri = expandUri(req.path, req.params);
                        req._hateoasLink = link;
                        req._schema = schemaModel;
                        req._result = req.body;
                        next();
                    };
                target = "/" + linkHref;
                list[target] = list[target] || {};
                list[target][link.method] = list[target][link.method] || {};
                list[target][link.method][rel] = list[target][link.method][rel] || handlerFunc;
                console.log("created : " + target + " " + link.method + " " + rel);
            });
        }
    });

    //
    // The main endpoint handler that determines the link
    // handler to process
    //
    targetHandler = function (req, res, next) {
        var rel = req.headers.pragma, handler;
        rel = (rel && rel.split("=")[1]) || "schema/rel/self";
        console.log("Target: " + req.route);
        console.log("Rel: " + rel);
        handler = (rel && list[req.route.path][req.method][rel]) || defaultHandler;

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