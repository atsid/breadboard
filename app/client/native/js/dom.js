define(["dojo/dom-construct"], function (domConstruct) {

    "use strict";

    return {
        /**
         * Returns a dom element by id.
         * @param id
         * @returns {HTMLElement}
         */
        byId: function (id) {
            return document.getElementById(id);
        },
        /**
         * Creates a new dom element.
         * @param type - e.g., "div"
         * @param [args] - if present, these properties will be set on the new dom element.
         * @param [parent] - if present, new element will be appended to the parent immediately.
         * @returns {HTMLElement}
         */
        create: function (type, args, parent) {
            var element = document.createElement(type);
            if (args) {
                this.update(element, args);
            }
            if (parent) {
                this.append(parent, element);
            }
            return element;
        },
        /**
         * Updates an element by copying properties from a passed object.
         * @param element
         * @param args
         * @returns {*}
         */
        update: function (element, args) {
            Object.keys(args).forEach(function (key) {
                element[key] = args[key];
            });
            return element;
        },
        /**
         * Appends a child node to a parent.
         * @param parent
         * @param child
         */
        append: function (parent, child) {
            parent.appendChild(child);
        },
        /**
         * Empties out child elements from a dom element.
         * @param id
         */
        empty: function (elementOrId) {
            if (typeof elementOrId === "string") {
                domConstruct.empty(elementOrId);
            } else {
                domConstruct.empty(elementOrId.id);
            }

        }
    };
});
