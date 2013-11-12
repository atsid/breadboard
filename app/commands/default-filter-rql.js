function filter (context, callback) {

    /**
     * This filter function determines if a link should be present by applying an RQL query against the
     * arguments, and only returning the link if the query evaluates true.
     */

    callback(context.link); //TODO: actually perform the filtering

};