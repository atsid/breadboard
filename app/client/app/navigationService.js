define([
    '../lang'
], function (lang) {

    var dummy = {
        "item": {
            "_id": 1,
            "uri": "hello/world",
            "name": "universe"
        },
        "links": [{
            "rel": "schema/rel/self",
            "href": "application",
            "method": "GET",
            "schema": {
                "$ref": "schema/models/Application"
            }
        }, {
            "rel": "schema/rel/users",
            "href": "application/users",
            "method": "GET",
            "schema": {
                "$ref": "schema/models/UserList"
            }
        }]
    };

    return {
        exec: function (uri, method, callback) {
            callback(dummy);
        }
    };
});