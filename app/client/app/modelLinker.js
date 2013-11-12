define([
    'dojo/_base/array',
    './crudService',
    './navigationService'
], function (
    dojoArray,
    crudService,
    navigationService
) {

    var relTolabel = {
        "schema/rel/self": "Refresh",
        "schema/rel/create": "Create",
        "schema/rel/edit": "Edit",
        "schema/rel/remove": "Delete"
    };

    return {
        addLinks: function (links, mvc) {
            dojoArray.forEach(links, function (link) {
                var action, label;
                switch (link.rel) {
                    case "schema/rel/monitor":
                        action = this.createMonitor(link, mvc);
                        break;
                    case "schema/rel/create":
                        action = this.createNavigationButton(link, mvc);
                        break;
                    case "schema/rel/edit":
                        action = this.createNavigationButton(link, mvc);
                        break;
                    case "schema/rel/remove":
                        action = this.createModelActionButton(link, mvc);
                        break;
                    default:
                        label = link.rel.split('/');
                        label = label[label.length - 1];
                        label = label.charAt(0).toUpperCase() + label.substr(1);
                        action = this.createNavigationButton(link, mvc, label);
                }
            }, this);
        },

        createMonitor: function (link, mvc) {
            var monitor,
                createRefresh = function () {
                    monitor = setInterval(function () {
                        mvc.refresh();
                    }, 15000);
                    mvc.own({
                        remove: function () {
                            clearInterval(monitor);
                        }
                    });
                };
            mvc.on('render', createRefresh);
        },

        createNavigationButton: function (link, mvc, label) {
            label = label || relToLabel(link.rel);
            mvc.createButton(label, function () {
                navigationService.exec(link.uri, link.method, function (response) {
                    mvc.onNavigate(response);
                });
            });
        },

        createModelActionButton: function (link, mvc) {
            var label = relToLabel(link.rel);
            mvc.createButton(label, function () {
                if (label === 'Delete') {
                    if (confirm("Are you sure?") != true) {
                        return;
                    }
                }
                crudService.exec(link.uri, link.method, mvc.getModel(), function (response) {
                    mvc.onNavigate(response);
                });
            });
        }
    }
});