"use strict";

var fs = require("fs");

/**
 * Loads a specified configFile and iterates its properties, calling app.set() on them with the values.
 * This function recursively walks the JSON and generates app.set keys using dot-notation.
 * For example:
 * {
 *     params: {
 *         someparam: "hi"
 *     }
 * }
 *
 * will call app.set("params.someparam", "hi");
 *
 * @param app
 * @param configFile
 */
exports.load = function (app, config) {

    console.log("loading config for " + config.app.path);

    function walk(parent, obj) {

        Object.keys(obj).forEach(function (key) {

            var value = obj[key],
                fullKey = parent ? parent + "." + key : key;

            if (typeof value === "object") {
                walk(fullKey, value);
            } else {
                app.set(fullKey, value);
            }

        });

    }

    walk("", config);
};
