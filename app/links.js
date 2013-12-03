"use strict";

var async = require("async"),
    argLoader = require("./args");

exports.expandHref = function (uri, params) {
    if (uri) {
        Object.keys(params).forEach(function (param) {
            uri = uri.replace("{" + param + "}", params[param]);
        });
    }
    return uri;
};

/**
 * Iterate the list of links on a schema, and determine which ones to keep for a given instance based on filter execution.
 * @param schema
 * @param context
 * @param reqPath
 * @param app
 * @param config
 * @param callback
 */
exports.filter = function (schema, context, reqPath, app, config, callback) {

    var functions = [],
        linkFunction = function (instanceLink, done) {

            console.log("checking link to determine if it should be added [" + instanceLink.rel + "]");

            var filter = instanceLink.filter,
                filterCommand = filter ? "./" + filter.command : app.get("defaults.filter"),
                filterArguments = filter && filter.arguments ? filter.arguments : {},
                filterHandler = require(filterCommand),
                selfUri = context.result ? (context.result.uri || reqPath) : ""; //could be no result in the case of a DELETE

            argLoader.load(filterArguments, app, function (args) {

                function keeper (linkToKeep) {

                    if (linkToKeep) {

                        var linkCopy = {
                            href: exports.expandHref(linkToKeep.href, context.params),
                            rel: linkToKeep.rel,
                            method: linkToKeep.method,
                            filter: linkToKeep.filter,
                            logic: linkToKeep.logic,
                            schema: linkToKeep.schema
                        }

                        done(null, linkCopy);

                    }
                }

                filterHandler.execute({
                        params: context.params,
                        link: instanceLink,
                        entity: context.entity,
                        result: context.result,
                        args: args
                    },
                    app,
                    keeper);

            });
        };

    schema.links.forEach(function (schemaLink) {
        functions.push(function (callback) {
            linkFunction(schemaLink, callback);
        });

    });

    async.parallel(functions, function (err, results) {
        callback(results);
    });

};