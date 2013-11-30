define([
    '../lang'
], function (lang) {
    return {
        getProperties: function (item, isEditable) {
            var model;
            if (Array.isArray(item)) {
                model = item.slice(0);
            } else {
                model = {};
                lang.forIn(item, function (value, prop) {
                    if (!isEditable || !schema[prop].readonly) {
                        if (!lang.isPrimitive(value)) {
                            value = this.getProperties(value, isEditable);
                        }
                        model[prop] = value;
                    }
                }, this);
            }
            return model;
        }
    };
});