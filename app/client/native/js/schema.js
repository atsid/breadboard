define(function () {

    "use strict";

    var schemas = {};

    return {
        load: function (uri) {
            var cached = schemas[uri],
                content;

            if (cached) {
                return cached;
            }

            function syncXhr(url) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                xhr.send();
                return xhr.responseText;
            }

            content = JSON.parse(syncXhr(uri));

            schemas[uri] = content;
            return content;
        },
        find: function (links, rel) {
            var result;
            links.some(function (link) {
                if (link.rel === rel) {
                    result = link;
                    return true;
                }
            });
            return result;
        }
    };
});