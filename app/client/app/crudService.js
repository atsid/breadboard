define([
    '../lang',
    'dojo/request/xhr'
], function (lang, xhr) {

    var bodyMethods = {
        "POST": 1,
        "PUT": 1
    };

    return {
        exec: function (link, model, callback) {
            var options = {
                handleAs: "json",
                method: link.method || "GET"
            };
            if (bodyMethods[link.method]) {
                options.data = model;
            }
            callback = callback || model;
            xhr(link.href, options).then(callback);
        }
    };
});