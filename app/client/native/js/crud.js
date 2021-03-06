define([
    'dojo/request/xhr'
], function (xhr) {

    "use strict";

    var bodyMethods = {
        "POST": 1,
        "PUT": 1
    };

    return {
        exec: function (link, model, callback) {
            var options = {
                handleAs: "json",
                method: link.method || "GET",
                headers: {
                    "Pragma": "hateoas-rel=" + (link.rel || "")
                }
            };
            if (bodyMethods[link.method]) {
                options.data = model;
            }
            callback = callback || model;
            xhr(link.href, options).then(callback);
        }
    };
});