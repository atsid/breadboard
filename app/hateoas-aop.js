/**
 * Stages of request processing to implement hateoas using express middleware.
 * The following additinoal internal fields on the request are used if they exist:
 * req._hateoasLink
 * req._schema
 * req._result
 *
 */
"use strict";

var command = require("./command"),
    config = require("./appconfig.json");

// Generalize execution for some of the phases.
function executePhase(phase, req, def, next) {
    var p = phase;
    if (!phase) {
        p = def;
    }
    command.execute(p, req, req.headers.host, function (err) {
        next();
    });
}

//
// Add a context to the request used for uri template replacements.
//
exports.addContext = function (req, res, next) {
    var ctx = {}, p;
    console.log("Adding context to request.");
    for (p in req.params) {
        ctx[p] = req.params[p];
    }
    req._ctx = ctx;
    next();
};

//
// Perform any processing specified in the schema to be done
// before the main "process" processing.
//
exports.before = function (req, res, next) {
    var before = req._hateoasLink && req._hateoasLink.before;
    console.log("Calling 'before' on " + JSON.stringify(before));
    executePhase(before, req, {}, next);
};

//
// Perform any processing specified in the schema to be done
// before the main "process" processing.
//
exports.after = function (req, res, next) {
    var after = req._hateoasLink && req._hateoasLink.after;
    console.log("Calling 'after' on " + JSON.stringify(after));
    executePhase(after, req, {}, next);
};

//
// Perform the main "process" processing using the default
// if no overrides have been specified in the schema.
//
exports.process = function (req, res, next) {
    var process = req._hateoasLink && req._hateoasLink.process;
    console.log("Calling 'process' on " + JSON.stringify(process));
    executePhase(process, req, {
        command: config.defaults.logic[req.method.toLowerCase()]
    }, next);
};

//
// Allow return links to be filtered according the declarations
// on the schema.
//
exports.filter = function (req, res, next) {
    var filter = req._hateoasLink && req._hateoasLink.filter;
    console.log("Calling 'filter' on " + JSON.stringify(filter));
    executePhase(filter, req, {
        command: config.defaults.filter
    }, next);
};

//
// Prepare and the send the response using the output of the
// previous stages.
//
exports.final = function (req, res, next) {
    var status = req.method === "post" ? 201 : (req.method === "delete" ? 204 : 200);
    function expandString(str, params) {
        if (str) {
            Object.keys(params).forEach(function (param) {
                str = str.replace("{" + param + "}", params[param]);
            });
        }
        return str;
    }
    function recurseProps(prop, obj, params) {
        if (typeof (obj[prop]) === "string") {
            obj[prop] = expandString(obj[prop], params);
        } else if (typeof (obj[prop]) === "object") {
            Object.keys(obj[prop]).forEach(function (item) {
                recurseProps(item, obj[prop], params);
            });
        }
    }

    //anything used on the backend that has an "_" prefix should be stripped from what is sent to clients, so recurse the result and clean it up
    function stripPrivate(result) {
        if (result) {
            var copy = {};
            Object.keys(result).forEach(function (key) {
                var value = result[key],
                    out = value;
                if (key.indexOf("_") !== 0) {
                    if (typeof value === "object") {
                        if (value.length) {
                            out = [];
                            value.forEach(function (val) {
                                out.push(stripPrivate(val));
                            });
                        } else {
                            out = stripPrivate(value);
                        }
                    }
                    copy[key] = out;
                }
            });
            return copy;
        }
    }

    recurseProps("_links", req, req._ctx);

    res.status(status).send({
        data: stripPrivate(req._result),
        links: req._links
    });
};