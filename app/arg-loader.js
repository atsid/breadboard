var async = require("async"),
    http = require("http");

module.exports = {
    // executes an http get for every arg and pushes it into the args map
    loadArguments: function (context, linkHrefExpander, args, callback) {
        var argValues = {}, functionList = {};


        Object.keys(args).forEach(function (arg) {
            var argUri = linkHrefExpander(args[arg], context.params);

            functionList[arg] = function (callback) {
                http.get("http://localhost:3000/" + argUri, function (res2) {
                    res2.on('data', function (res3) {
                        res3 = ("" + res3).replace(/null/g, '""').replace(/\n/g, "").replace(/\"\{/g, "{").replace(/\}\"/g, "}").replace(/\\\"/g, '"');
                        if (res2.headers['content-type'].match(/^application\/json/)) {
                            argValues[arg] = JSON.parse("" + res3);
                        } else {
                            argValues[arg] = res3;
                        }
                        callback(null, res3);
                    });
                });
            };
        });

        async.series(functionList, function (err, results) {
            callback();
        });

        return argValues;
    }
}