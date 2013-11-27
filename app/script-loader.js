"use strict";

var fs = require("fs"),
    loadScriptText = function (scriptLocation, defaultScript) {
        if (scriptLocation) {
            return fs.readFileSync(scriptLocation + ".js", "UTF-8");
        } else {
            return fs.readFileSync(defaultScript + ".js", "UTF-8");
        }
    };


module.exports = function (scriptLocation, defaultScript, locationKey) {
    var scriptText, finalLocation = scriptLocation;

    if (scriptLocation && locationKey && scriptLocation[locationKey]) {
        finalLocation = scriptLocation[locationKey];
    }

    scriptText = loadScriptText(finalLocation, defaultScript);

    /*jslint evil: true */
    return eval("(function(){return " + scriptText + "})()");
};