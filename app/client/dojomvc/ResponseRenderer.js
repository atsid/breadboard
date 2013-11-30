define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    './app/modelRenderer',
    './app/modelLinker',
    './app/crudService',
    './app/appView'
],
function (
    declare,
    dojoLang,
    modelRenderer,
    modelLinker,
    crudService,
    appView
) {
    return declare(null, {

        render: function (response) {
            var _this = this;
            this.getItems(response, function (items) {
                appView.set('title', response.title || "");
                appView.clear();
                items.forEach(function (item) {
                    var isEditable = true, //todo
                        mvc = modelRenderer.render(item, isEditable);
                    modelLinker.addLinks(response.links, mvc);
                    appView.addMvc(mvc);
                    mvc.on('Navigate', function (response) {
                        _this.render(response);
                    });
                });
            });
        },

        getItems: function (response, callback) {
            var count = 0,
                item = response.data || {},
                responseItems = item.items ? item.items : [item],
                total = responseItems.length || 1,
                items = [],
                testReady = function (item, i) {
                    items[i] = item;
                    count += 1;
                    if (count === total) {
                        callback(items);
                    }
                };

            if (!responseItems.length) {
                responseItems = [{}];
            }
            responseItems.forEach(function (responseItem, i) {
                var item = dojoLang.mixin({}, responseItem);
                if (item.href) {
                    crudService.exec({uri: item.href}, function (model) {
                        testReady(model, i);
                    });
                } else {
                    testReady(item, i);
                }
            });
        }
    });
});