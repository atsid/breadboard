define([
], function () {
    return {
        forIn: function (obj, fn, scope) {
            var keys = Object.keys(obj);
            keys.forEach(function (prop) {
                fn.call(scope, obj[prop], prop, obj);
            });
        },

        isPrimitive: function (val) {
            var type = typeof (val);
            return val === null || type === 'undefined' || type === 'boolean' || type === 'number' || type === 'string';
        },

        /**
         * Remove an item from an array. The array is modified.
         * @param {Array} arr Array to remove item from
         * @param {any} item The item to remove
         * @return {Array} arr The modified array
         */
        arrayRemove: function (arr, item) {
            var index = arr.indexOf(item);
            if (index > -1) {
                arr.splice(index, 1);
            }
            return arr;
        },

        /**
         * Convert an array-like object to an Array. Array-like types are "arguments",
         * NodeList, ... The purpose of converting is to use Array methods like splice.
         * @param {Object} arrayLike An object that is array-like
         * @return {Array} Input converted to an Array
         */
        toArray: function (arrayLike) {
            return Array.prototype.slice.call(arrayLike);
        }
    };
});