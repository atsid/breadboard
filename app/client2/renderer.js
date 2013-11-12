define([
    "dojo/dom",
    "dojo/dom-construct",
    "my/app/crudService"
], function (
    dom,
    domConstruct,
    crudService
) {

    var actions = {
        "schema/rel/create": function (link, links) {

            console.log("rendering edit form for " + link.rel);
            var schema = getSchema(link.schema.$ref);
            link.schema = JSON.parse(schema);

            var backLink;
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
            var schema = getSchema(link.schema.$ref);
            link.schema = JSON.parse(schema);

            var backLink;
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
    };

    //these are links we don't show directly
    var hide = {
        "schema/rel/monitor": true,
        "schema/rel/item": true
    };

    //_id is private, let's not display
    var hideProps = {
        "_id": true
    };

    var schemas = {};
    function getSchema(url) {
        var cached = schemas[url];
        if (cached) {
            return cached;
        }
        function syncXhr(url) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.send();
            return xhr.responseText;
        }
        var content = syncXhr(url);
        schemas[url] = content;
        return content;
    }

    function addItem(item, container) {
        Object.keys(item).forEach(function (key) {

            if (!hideProps[key]) {
                var value = item[key];
                var label = document.createElement("label");
                label.innerHTML = key;
                var element;
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
        var schema = link.schema;
        var properties = schema.properties;

        domConstruct.empty("secondAppContainer");

        var container = dom.byId("secondAppContainer");
        var elements = {};

        Object.keys(properties).forEach(function (key) {

            console.log(key);
            var value = properties[key];

            if (!hideProps[key]) {
                console.log("rendering " + key + " | " + value);
                var label = document.createElement("label");
                label.innerHTML = key;
                var element = document.createElement("input");
                element.type = "text";
                element.className = "item-" + key;
                elements[key] = element;

                if (item && item[key]) {
                    element.value = item[key];
                }

                if (value.readonly) {
                    element.disabled = true;
                }
                container.appendChild(label);
                container.appendChild(element);

            } else {
                console.log(key + " is hidden or readonly");
            }
        });

        var submit = document.createElement("button");
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
        var header = document.createElement("header");
        header.innerHTML = "Item";
        container.appendChild(header);

        var data = response.data;

        addItem(data, container);

    }

    function renderItems(response, container) {
        var header = document.createElement("header");
        header.innerHTML = "Items";
        container.appendChild(header);

        var data = response.data;
        var items = data.items;

        items.forEach(function (item) {

            addItem(item, container);

            var br = document.createElement("br");
            container.appendChild(br);

        });
    }

    function renderLinks(response, container) {

        var header = document.createElement("header");
        header.innerHTML = "Links";
        container.appendChild(header);

        var links = response.links;

        links.forEach(function (link) {
            console.log("processing link", link);
            var rel = link.rel;

            if (!hide[rel]) {

                var button = document.createElement("button");
                var word = rel.substring(rel.lastIndexOf("/") + 1, rel.length);
                var text = word.substring(0, 1).toUpperCase() + word.substring(1, word.length);
                text = text.replace("-", " ");

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
                if (response.data.items) {
                    renderItems(response, container);
                } else {
                    renderItem(response, container);
                }

                renderLinks(response, container);

            });

        }

    };

    return renderer;
});