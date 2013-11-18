exports.execute = function (context, app, callback) {

    //TODO: this should just load the regular read file, execute it, and return the first (only) one
    console.log("read application called");
    console.log(JSON.stringify(context));

    var file = require("../util/file.js"),
        cname = "Application",
        root = app.get("dataPath"),
        path = root + cname;

    console.log("object storage is in " + path);

    file.forceReadJSONDirectory(path, function (err, files) {
        console.log("files", files);
        context.result = files[0] || null;
        context.result.uri = "application"; //TODO: kludge to override weird replacement
        callback(context);
    });

};
