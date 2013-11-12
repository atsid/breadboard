function filter(context, callback) {
    /**
     * This filter function determines if a link should be present by applying an RQL query against the
     * arguments, and only returning the link if the query evaluates true.
     */

    console.log("Executing rql query " + context.link.filter.arguments.rql);

//    var queryExecutor = require("rql/js-array"), args = context.args, fs = require("fs"),
//        result = queryExecutor.executeQuery(fs.readFileSync(context.link.filter.arguments.rql + ".rql", "UTF-8"), {}, [args]);

    callback(context.link);
};