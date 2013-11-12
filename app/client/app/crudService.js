define([
    '../lang',
    'dojo/request/xhr'
], function (lang, xhr) {

    var dataRels = {
        "schema/rel/create": 1,
        "schema/rel/edit": 1
    };

    return {
        exec: function (link, model, callback) {
            var options = {
                handleAs: "json",
                method: link.method || "GET"
            };
            if (dataRels[link.rel]) {
                options.data = model;
            }
            callback = callback || model;
            xhr(link.href, options).then(callback);
        }
    };
});