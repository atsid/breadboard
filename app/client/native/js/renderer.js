define([
    "./dom",
    "./crud",
    "./schema"
], function (
    dom,
    crud,
    schema
) {

    "use strict";

    //this maps CRUD operations to link methods
    var actions = {
        "GET": function (link, links, data, container) {
            renderer.render(link.href, container);
        },
        "POST": function (link, links, data, container) {

            console.log("rendering create form for " + link.rel);
            var s = schema.load(link.schema.$ref),
                selfLink = schema.find(links, "schema/rel/self"),
                backLink;

            link.schema = s;

            if (selfLink) {
                backLink = {
                    rel: "schema/rel/up",
                    "method": selfLink.method,
                    "href": selfLink.href
                };
            }

            createForm(link, backLink, data, container);

        },
        "PUT": function (link, links, data, container) {

            console.log("rendering edit form for " + link.rel);
            var s = schema.load(link.schema.$ref),
                selfLink = schema.find(links, "schema/rel/self"),
                backLink;

            link.schema = s;

            if (selfLink) {
                backLink = {
                    rel: "schema/rel/up",
                    "method": selfLink.method,
                    "href": selfLink.href
                };
            }

            createForm(link, backLink, data, container);

        },
        "DELETE": function (link, links, data, container) {
            crud.exec(link, null, function (response) {
                var parentLink = schema.find(links, "schema/rel/collection");
                renderer.render(parentLink.href, container);
            });
        }
    },
    //these are links we don't show directly
    hideLinks = {
        "schema/rel/monitor": true, //monitor can be used to setup polling
        "schema/rel/item": true //TODO: this should be used to load items in a collection, rather than clicking the href like we currently do
    },
    //properties on the response objects that may be "private" so we don't really want to show them
    hideProps = {
        "_id": true
    },
    friendlyMap = {
        "schema/rel/self": "Refresh",
        "schema/rel/collection": "Parent List"
    };


    //make a friendly label
    function friendly(rel) {
        var text = friendlyMap[rel],
            word;
        if (!text) {
            //if there isn't any friendly text pre-defined for a link, we'll make it look a little prettier
            word = rel.substring(rel.lastIndexOf("/") + 1, rel.length);
            text = word.substring(0, 1).toUpperCase() + word.substring(1, word.length).replace("-", " ");
        }
        return text;
    }

    function addItem(item, table, container) {

        console.log("adding item " + item.uri);

        var keys = Object.keys(item),
            tr = dom.create("tr");

        keys.sort();

        keys.forEach(function (key) {

            var value = item[key],
                label, element,
                td = dom.create("td", {className: "item-" + key});

            if (!hideProps[key]) {

                label = dom.create("label", {innerHTML: key}, label);

                if (key === "uri") {
                    element = dom.create("a", {
                        href: "#",
                        innerHTML: value,
                        onclick: function () {
                            renderer.render(value, container);
                        }
                    });
                    dom.append(td, element);
                } else {
                    td.innerHTML = value;
                }

                dom.append(tr, td);

            }

        });

        dom.append(table, tr);
    }

    function createForm(link, backLink, item, container) {

        console.log("creating form for " + link.rel);

        dom.empty(container);

        var header = dom.create("header", {innerHTML: friendly(link.rel).toUpperCase()}, container),
            schema = link.schema,
            properties = schema.properties,
            keys = Object.keys(properties),
            elements = {};

        keys.sort();

        keys.forEach(function (key) {

            var value = properties[key],
                label, element;

            if (!hideProps[key]) {
                label = dom.create("label", {innerHTML: key}, container);
                element = dom.create("input", {
                    type: "text",
                    className: "item-" + key
                });

                if (item && item[key]) {
                    element.value = item[key];
                }

                if (value.readonly) {
                    label.style.display = "none";
                    element.style.display = "none";
                }

                elements[key] = element;

                dom.append(container, element);
                dom.create("br", null, container);

            } else {
                console.log(key + " is hidden or readonly");
            }

        });

        //create the submit button
        dom.create("button", {
            innerHTML: "Submit",
            onclick: function () {
                var data = {};
                Object.keys(elements).forEach(function (key) {
                    var element = elements[key];
                    data[key] = element.value;
                });
                crud.exec(link, data, function (response) {
                    var selfLink = schema.find("schema/rel/self");
                    renderer.render(selfLink.href, container);
                });
            }
        }, container);

        renderLinks({
            links: [backLink]
        }, container);

    }

    function tableStart(item, container) {
        //TODO: use the response schema to determine the table template, instead of grabbing an item from the list
        var keys = Object.keys(item),
            table = dom.create("table"),
            tr = dom.create("tr", null, table);

        keys.sort();

        keys.forEach(function (key) {
            if (!hideProps[key]) {
                dom.create("th", {innerHTML: key}, tr);
            }
        });

        dom.append(container, table);
        return table;
    }

    function renderItem(response, container) {
        var header = dom.create("header", {innerHTML: "ITEM"}, container),
            data = response.data,
            table;

        if (data) {
            table = tableStart(data, container);
            addItem(data, table, container);
        } else {
            dom.create("p", {innerHTML: "(No item details)"}, container);
        }

    }

    function renderItems(response, container) {

        var header = dom.create("header", {innerHTML: "ITEMS"}, container),
            data = response.data,
            items = data.items,
            table;

        if (items.length > 0) {
            table = tableStart(items[0], container);
            items.forEach(function (item) {
                addItem(item, table, container);
            });
        } else {
            dom.create("p", {innerHTML: "(No items in list)"}, container);
        }

    }

    function renderLinks(response, container) {

        var header = dom.create("header", {innerHTML: "LINKS"}, container),
            links = response.links;

        links.forEach(function (link) {
            var rel = link.rel,
                method = link.method || "GET",
                button, text = friendly(rel);

            if (!hideLinks[rel]) {

                button = dom.create("button", {
                    innerHTML: text,
                    onclick: function () {
                        console.log("link clicked! " + rel + " | " + method);
                        var action = actions[link.method];
                        action(link, links, response.data, container);

                    }
                }, container);

            }

        });

    }

    var renderer = {

        render: function (uri, container) {

            dom.empty(container);

            crud.exec({href: uri}, function (response) {

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