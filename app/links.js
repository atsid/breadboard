var scriptLoader = require("./script-loader"),
    clone = require("clone"),
    async = require("async");

module.exports = {
    expandHref: function (uri, params) {
        if (uri) {
            Object.keys(params).forEach(function (param) {
                uri = uri.replace("{" + param + "}", params[param]);
            });
        }

        return uri;
    },
    // Using argLoader as an argument here instead of a requires above due to circular referencing possibility.
    filter: function (context, req, argLoader, schemaModel, filterCompleteCallback) {
        var outputLinks = [], schemaLinkFunctions = [],
            linkFunction = function (context, outputLinks, req, instanceLink, schemaCallback) {
                console.log("checking the links to determine if they should be added " + instanceLink.rel);

                var linkFilter = instanceLink.filter,
                    linkFilterArguments = linkFilter && linkFilter.arguments ? linkFilter.arguments : {},
                    linkFilterHandler = scriptLoader(linkFilter, "./commands/default-filter-include", "command"),
                    selfUri = context.result ? (context.result.uri || req.path) : "",
                    argValues = argLoader.loadArguments(context, linkFilterArguments, function () {
                        linkFilterHandler({
                            params: context.params,
                            link: instanceLink,
                            entity: context.entity,
                            result: context.result,
                            args: argValues
                        }, function (linkToKeep) {
                            if (linkToKeep) {
                                var href = instanceLink.href[0] === "/" ? instanceLink.href : "/" + instanceLink.href;
                                href = req.path + href.substring(req.path.length);
                                console.log("----------------------");
                                console.log("req.path: " + req.path);
                                console.log("href: " + instanceLink.href);
                                console.log("Rel: " + linkToKeep.rel);
                                console.log("New href: " + href);
                                linkToKeep.href = instanceLink.rel === "schema/rel/self" ? selfUri : module.exports.expandHref(linkToKeep.href, context.params);
                                outputLinks.push(linkToKeep);
                            }
                        });
                        schemaCallback(null);
                    })

                if (context.result) {
                    console.log("result uri:" + context.result.uri);
                }
            };

        schemaModel.links.forEach(function (schemaLink) {
            schemaLinkFunctions.push(function (schemaCallback) {
                // Make sure we use a clone of the schema model so we don't modify the original!!!
                linkFunction(context, outputLinks, req, clone(schemaLink), schemaCallback);
//                linkFunction = function (context, outputLinks, req, instanceLink, schemaCallback) {
            });
        });

        async.series(schemaLinkFunctions, function () {
            console.log("finished iterating links")
            var response = {
                data: context.result,
                links: outputLinks
            };

            filterCompleteCallback(response);
        });

    }
}