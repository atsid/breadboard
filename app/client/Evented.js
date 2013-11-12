define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/Evented',
    'dojo/_base/connect',
    './lang'
], function (
    declare,
    dojoLang,
    DojoEvented,
    dojoConnect,
    lang
) {
    /**
     * @class PTO.Evented
     * @extends dojo.Evented
     * This class provides eventing for non-widgets, and automatic eventing cleanup
     * upon destroy.
     */
    return declare(DojoEvented, {
        constructor: function () {
            this._owns = [];
        },

        /**
         * Own an ownable. Ownable's remove method is called on destroy.
         * @param {*} ownable
         */
        own: function (ownable) {
            this._owns.push(ownable);
            return ownable;
        },

        /**
         * Creates event wiring using dojo/on
         * @param {String} type Named event or name of function to "connect" to,
         *                      but w/o 'on' portion of method name.
         * @param {Function|String} func Function or function name for listener.
         * @param {Object} [scope] Scope to hitch function with.
         * @param {*} [additionalArgs] Additional n args to pass to hitch and will be passed
         *                             to the listener function as the first n arguments.
         * @return {Object} On handle
         */
        on: function (type, func, scope, additionalArgs) {
            if (typeof func === 'string' || arguments.length >= 3) {
                scope = scope || this;
                var args = lang.toArray(arguments);
                args.splice(0, 3, scope, func);
                func = dojoLang.hitch.apply(dojoLang, args);
            }
            return this.own(this.inherited(arguments, [type, func]));
        },

        /**
         * One-time eventing using on. Event handle is own'd so in case event never fires, wiring is remove'd.
         * @param {String} type Like "click" or method name w/o leading "on" and first letter lowercase
         * @param {String|Function} func Listener function or function name. If string, must specify scope.
         * @param {Object} [scope] Scope for execution of func
         * @param {*} [additionalArgs] ... Any additional arguments are passed to func as the first args
         * @return {*} Event handle with 'remove' method
         */
        once: function (type, func, scope, additionalArgs) {
            var args, signal;

            args = lang.toArray(arguments);
            args.splice(0, 3);
            signal = this.on(type, function () {
                signal.remove();
                if (scope) {
                    func = dojoLang.hitch(scope, func);
                }
                args = args.concat(arguments);
                func.apply(this, args);
            });
            return signal;
        },

        /**
         * Remove the event wiring for an 'on' event.
         * @param {Object} onHandle
         */
        un: function (onHandle) {
            this.disconnect(onHandle);
        },

        /**
         * Create event wiring using dojo/connect. 'this' is automatically set as the scope for the listener execution.
         * @param {Object} target Target object whose function (targetMethod) will be used to trigger event.
         * @param {String|Function} targetMethod Method name or function reference of method for event trigger.
         * @param {String|Function} func If a string this[func] is used as the listener, else func is used directly.
         * @param {*} eventArgs All parameters after func will be passed to the event listener - via using
         * @return {Object} Connect handle
         */
        connect: function (target, targetMethod, func, eventArgs) {
            var args = arguments, me = this;
            if (args.length > 3) {
                args = lang.toArray(args);
                args.splice(0, 2, me);
                func = dojoLang.hitch.apply(dojoLang, args);
            }
            return me.own(dojoConnect.connect(target, targetMethod, me, func));
        },

        /**
         * Remove the event wiring for a 'connect' event.
         * @param {Object} connectHandle
         */
        disconnect: function (connectHandle) {
            lang.arrayRemove(this._owns, connectHandle);
            connectHandle.remove();
        },

        /**
         * Remove all event wiring.
         */
        destroy: function () {
            this._owns.forEach(function (ownable) {
                ownable.remove();
            });
            this.inherited(arguments);
        }
    });
});