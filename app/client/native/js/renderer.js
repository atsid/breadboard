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
    var renderer,
        actions = {
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
                        method: selfLink.method,
                        href: selfLink.href,
                        title: "Back"
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
                        method: selfLink.method,
                        href: selfLink.href,
                        title: "Back"
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
        //properties on the response objects that don't have direct value to the user
        hideProps = {
            "uri": true
        };

    function createForm(link, backLink, item, container) {

        console.log("creating form for " + link.rel);

        dom.empty(container);

        var header = dom.create("header", {innerHTML: link.title.toUpperCase()}, container),
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
            onclick: function (e) {
                e.target.disabled = true;
                var data = {};
                Object.keys(elements).forEach(function (key) {
                    var element = elements[key];
                    data[key] = element.value;
                });
                crud.exec(link, data, function (response) {
                    console.log("received successful edit");
                    //go back to the previous view now that the form submission is complete
                    renderer.render(backLink.href, container);
                });
            }
        }, container);

        renderLinks({
            links: [backLink]
        }, container);

        breadcrumb(link.href, container);

    }

    function addItem(item, table, container, includeLinkCell) {

        console.log("adding item " + item.uri);

        var keys = Object.keys(item),
            tr = dom.create("tr"),
            uri, linkcell, a;

        keys.sort();

        keys.forEach(function (key) {

            var value = item[key], td;

            if (key === "uri") {
                uri = value;
            }

            if (!hideProps[key]) {

                td = dom.create("td", {innerHTML: value, className: "item-" + key}, tr);

            }

        });

        //special cell to hold the object link
        if (includeLinkCell) {
            linkcell = dom.create("td", {className: "link-cell"}, tr);
            a = dom.create("a", {
                href: "#",
                innerHTML: "view",
                title: uri,
                className: "item-uri",
                onclick: function () {
                    renderer.render(uri, container);
                }
            }, linkcell);
        }


        dom.append(table, tr);
    }

    function tableStart(item, container, includeLinkCell) {
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

        if (includeLinkCell) {
            dom.create("th", {innerHTML: "details", className: "link-cell"}, tr);
        }

        dom.append(container, table);

        return table;
    }

    function renderItem(response, container) {
        var header = dom.create("header", {innerHTML: "ITEM"}, container),
            data = response.data,
            table;

        if (data) {
            table = tableStart(data, container, false);
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
            table = tableStart(items[0], container, true);
            items.forEach(function (item) {
                addItem(item, table, container, true);
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
                button, text = link.title;

            //only display links that have been given a title, so the schema can control the presentation
            if (text) {

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

    function breadcrumb(uri, container) {

        var splits = uri.split("/"),
            split,
            full = "",
            footnote = dom.create("footnote", {innerHTML: "You are here: "}),
            i, l, a, text;

        function click(e) {
            renderer.render(e.target.tag, container);
        }

        for (i = 0, l = splits.length; i < l; i += 1) {
            split = splits[i];
            full += split;
            if (i < l - 1) {
                full += "/";
            }
            a = dom.create("a", {
                innerHTML: split,
                href: "#",
                tag: full,
                onclick: click
            }, footnote);

            if (l > 1 && i < l - 1) {
                text = dom.create("text", {innerHTML: "&nbsp;/&nbsp;"}, footnote);
            }

        }

        dom.append(container, footnote);

    }

    renderer = {

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

                breadcrumb(uri, container);

            });

        }

    };

    return renderer;

});