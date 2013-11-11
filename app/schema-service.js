var fs = require('fs');

module.exports = function (app, config) {
    app.get('/schema/models/:model', config.middleware, function (req, res, next) {
        res.status(200).sendfile("schema/models/" + req.params.model + ".json");
    });
}