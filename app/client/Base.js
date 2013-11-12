define([
    'dojo/_base/declare',
    'dojo/_base/lang'
], function (
    declare,
    dojoLang
) {
    /**
     * @class PTO.Base
     * @extends null
     * Provides a basic base class with config mixin and simple lifecycle.
     */
    return declare(null, {
        /**
         * The postscript method is called by declare's creation function after all class constructor
         * functions are called. For Base, postscript defines the class's characteristics.
         * @param {Object} config Config object passed to the constructor.
         */
        postscript: function (config) {
            dojoLang.mixin(this, config);
            this.runLifecycle();
        },

        /**
         * This method defines and executes the lifecycle. Override to provide a custom lifecycle.
         */
        runLifecycle: function () {
            this.postMixin();
            this.create();
        },

        /**
         * The purpose of this method in the lifecycle is for the instance to perform initialization
         * after all constructors have run and the config has been mixed in.
         */
        postMixin: function () {},

        /**
         * The purpose of this method in the lifecycle is for the instance to create itself and start its work.
         */
        create: function () {}
    });
});