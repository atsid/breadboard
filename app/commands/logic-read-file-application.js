exports.execute = function (context, app, callback) {

    var provider = require("../providers/file-reader");

    provider.readList({
        collection: "Application",
        app: app
    }, function (err, files) {
        context.result = files[0] || null;
        if (context.result) {
            context.result.uri = "application"; //TODO: kludge to override weird replacement
        }
        callback(context);
    });

};
