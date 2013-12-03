"use strict";

/**
 * This is the default filter function, and always includes the link in question.
 * In other words, if no filter criteria is specified, a given link will exist on the response.
 */
exports.execute = function (context, app, callback) {

    console.log("adding link without filter check [" + context.link.rel + "]");
    callback(context.link);

};