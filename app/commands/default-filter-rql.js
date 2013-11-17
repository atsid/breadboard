function filter(context, callback) {
    /**
     * This filter function determines if a link should be present by applying an RQL query against the
     * arguments, and only returning the link if the query evaluates true.
     */

    var queryExecutor = require("rql/js-array"), args = context.args, fs = require("fs"), queryText = fs.readFileSync(context.link.filter.arguments.rql + ".rql", "UTF-8"),
        result = queryExecutor.executeQuery(queryText, {}, [args]);

    callback(result.length > 0 ? context.link : null);
};