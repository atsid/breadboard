exports.find = function (links, rel) {
    var result;
    links.some(function (link) {
        if (link.rel === rel) {
            result = link;
            return true;
        }
    });
    return result;
};