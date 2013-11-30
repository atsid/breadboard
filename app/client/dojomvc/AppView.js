define([
    'dojo/_base/declare',
    'dijit/layout/ContentPane',
    'dijit/_TemplatedMixin'
],
function (
    declare,
    ContentPane,
    _TemplatedMixin
) {
    return declare([ContentPane, _TemplatedMixin], {

        templateString: '<div>' +
                '<div data-dojo-attach-point="titleNode"></div>' +
                '<div data-dojo-attach-point="containerNode"></div>' +
            '</div>',

        setTitle: function (title) {
            this.set('title', title);
        },

        _setTitleAttr: function (value) {
            this._set('title', value);
            this.titleNode.innerHTML = value;
        },

        clear: function () {
            this.destroyDescendants();
        },

        addMvc: function (mvc) {
            this.addChild(mvc.getWidget());
        }
    });
});