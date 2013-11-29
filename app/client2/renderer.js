define([
    "dojo/dom",
    "dojo/dom-construct",
    "my/app/crudService"
], function (
    dom,
    domConstruct,
    crudService
) {

    "use strict";

    var friendly = {
        "schema/rel/self": "Refresh",
        "schema/rel/up": "Up",
        "schema/rel/collection": "Parent List"
    },
    actions = {
        "schema/rel/create": function (link, links) {

            console.log("rendering edit form for " + link.rel);
            var schema = getSchema(link.schema.$ref),
                backLink;

            link.schema = JSON.parse(schema);

            links.forEach(function (item) {
                if (item.rel === "schema/rel/self") {
                    backLink = {
                        rel: "schema/rel/up",
                        "method": item.method,
                        "href": item.href
                    };
                }
            });

            renderForm(link, backLink);

        },
        "schema/rel/edit": function (link, links, item) {

            console.log("rendering edit form for " + link.rel);
            var schema = getSchema(link.schema.$ref),
                backLink;

            link.schema = JSON.parse(schema);

            links.forEach(function (item) {
                if (item.rel === "schema/rel/self") {
                    backLink = {
                        rel: "schema/rel/up",
                        "method": item.method,
                        "href": item.href
                    };
                }
            });

            renderForm(link, backLink, item);

        },
        "schema/rel/remove": function (link, links) {
            crudService.exec(link, null, function (response) {
                var parentLink;
                links.forEach(function (item) {
                    if (item.rel === "schema/rel/collection") {
                        parentLink = item;
                    }
                });
                renderer.render(parentLink.href);
            });
        }
    },
    hide = { //these are links we don't show directly
        "schema/rel/monitor": true,
        "schema/rel/item": true
    },
    hideProps = { //_id is private, let's not display
        "_id": true
    },
    schemas = {};

    function getSchema(url) {
        var cached = schemas[url],
            content;

        if (cached) {
            return cached;
        }

        function syncXhr(url) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.send();
            return xhr.responseText;
        }

        content = syncXhr(url);

        schemas[url] = content;
        return content;
    }

    function addItem(item, container) {
        console.log("adding item " + item.uri);
        var keys = Object.keys(item),
            value, label, element;

        keys.sort();
        keys.forEach(function (key) {

            if (!hideProps[key]) {
                value = item[key];
                label = document.createElement("label");
                label.innerHTML = key;
                element;
                if (key === "uri") {
                    element = document.createElement("a");
                    element.href = "#";
                    element.innerHTML = value;
                    element.onclick = function () {
                        console.log("clicked an element link:", value);
                        renderer.render(value);
                    };
                } else {
                    element = document.createElement("input");
                    element.type = "text";
                    element.value = value;
                }

                element.className = "item-" + key;
                element.name = key;
                element.tag = key;
                container.appendChild(label);
                container.appendChild(element);
            }
        });
    }

    function renderForm(link, backLink, item) {

        console.log(link);
        var schema = link.schema,
            properties = schema.properties,
            keys = Object.keys(properties),
            container, elements = {},
            submit;

        domConstruct.empty("secondAppContainer");

        container = dom.byId("secondAppContainer");

        keys.sort();

        keys.forEach(function (key) {

            console.log(key);
            var value = properties[key],
                label, element;

            if (!hideProps[key]) {
                console.log("rendering " + key + " | " + value);
                label = document.createElement("label");
                label.innerHTML = key;
                element = document.createElement("input");
                element.type = "text";
                element.className = "item-" + key;
                elements[key] = element;

                if (item && item[key]) {
                    element.value = item[key];
                }

                if (value.readonly) {
                    label.style.display = "none";
                    element.style.display = "none";
                }
                container.appendChild(label);
                container.appendChild(element);

            } else {
                console.log(key + " is hidden or readonly");
            }
        });

        submit = document.createElement("button");
        submit.innerHTML = "Submit";
        submit.onclick = function () {
            var data = {};
            Object.keys(elements).forEach(function (key) {
                var element = elements[key];
                data[key] = element.value;
            });
            console.log("saving item ", data);
            console.log('using link', link);
            crudService.exec(link, data, function (response) {
                var selfLink;
                response.links.forEach(function (item) {
                    if (item.rel === "schema/rel/self") {
                        selfLink = item;
                    }
                });
                renderer.render(selfLink.href);
            });
        };
        container.appendChild(submit);

        renderLinks({
            links: [backLink]
        }, container);

    }

    function renderItem(response, container) {
        var header = document.createElement("header"),
            data = response.data;

        header.innerHTML = "ITEM";
        container.appendChild(header);

        if (data) {
            addItem(data, container);
        }

    }

    function renderItems(response, container) {
        var header = document.createElement("header"),
            data = response.data,
            items = data.items,
            empty;

        header.innerHTML = "ITEMS";
        container.appendChild(header);

        if (items.length === 0) {
            empty = document.createElement("p");
            empty.innerHTML = "(No items in list)";
            container.appendChild(empty);
        } else {
            items.forEach(function (item) {

                addItem(item, container);

                var br = document.createElement("br");
                container.appendChild(br);

            });
        }

    }

    function renderLinks(response, container) {

        var header = document.createElement("header"),
            links = response.links;

        header.innerHTML = "LINKS";
        container.appendChild(header);

        links.forEach(function (link) {
            console.log("processing link", link);
            var rel = link.rel,
                button, text, word;

            if (!hide[rel]) {

                button = document.createElement("button");
                text = friendly[rel];
                if (!text) {
                    word = rel.substring(rel.lastIndexOf("/") + 1, rel.length);
                    text = word.substring(0, 1).toUpperCase() + word.substring(1, word.length);
                    text = text.replace("-", " ");
                }
                button.innerHTML = text;
                button.onclick = function () {

                    console.log("link clicked! " + rel);
                    var action = actions[rel];

                    //if no action defined, simply execute the href into the current pane
                    if (!action) {
                        renderer.render(link.href);
                    } else {
                        action(link, links, response.data);
                    }


                };
                container.appendChild(button);
            }

        });

    }

    var renderer = {

        render: function (uri) {

            domConstruct.empty("secondAppContainer");

            crudService.exec({href: uri}, function (response) {

                var container = dom.byId("secondAppContainer");

                console.log("got response to render", response);
                if (response.data) {
                    if (response.data.items) {
                        renderItems(response, container);
                    } else {
                        renderItem(response, container);
                    }
                }

                renderLinks(response, container);

            });

        }

    };

    return renderer;
});