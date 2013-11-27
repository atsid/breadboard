"use strict";

exports.execute = function (context, app, callback) {
    /**
     * This filter function determines if a link should be present by applying an RQL query against the
     * arguments, and only returning the link if the query evaluates true.
     */

    console.log("executing filter with context" + JSON.stringify(context));
    var queryExecutor = require("rql/js-array"),
        args = context.args,
        queryText = args.rql,
        result = queryExecutor.executeQuery(queryText, {}, [args]);

    callback(result.length > 0 ? context.link : null);
};