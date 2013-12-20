"use strict";

/**
 * This filter function determines if a link should be present by applying an RQL query against the
 * arguments, and only returning the link if the query evaluates true.
 */
exports.execute = function (context, callback) {

    console.log("executing rql filter " + context.args.rql);
    var queryExecutor = require("rql/js-array"),
        args = context.args,
        queryText = args.rql,
        result = queryExecutor.executeQuery(queryText, {}, [args]);

    callback(result.length > 0 ? context.link : null);
};