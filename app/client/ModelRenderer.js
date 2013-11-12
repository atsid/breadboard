define([
    'dojo/_base/declare',
    'dojox/mvc/Generate',
    'dojox/mvc/StatefulModel',
    'dojox/mvc/at',
    './app/modelHelper',
    './app/widgetMappings',
    'dijit/form/Button',
    'dojo/dom-construct',
    './Evented',
    './Base',
    'schematic/SchemaResolver',
    'dojo/parser'
],
function (
    declare,
    Generate,
    StatefulModel,
    at,
    modelHelper,
    widgetMappings,
    Button,
    domConstruct,
    Evented,
    Base,
    SchemaResolver
) {
    window.at = at;

    var MvcWrapper = declare([Base, Evented], {});

    return declare(null, {
        render: function (model, isEditable) {
            var statefulModel,
                generator,
                buttonBar,
                buttons = [];

            return new MvcWrapper({
                getWidget: function () {
                    statefulModel = new StatefulModel({data: model});
                    generator = new Generate({
                        children: statefulModel,
                        widgetMapping: widgetMappings
                    });
                    generator.srcNodeRef = domConstruct.create('div', {}, generator.domNode);
                    buttons.forEach(function (buttonDef) {
                        this.createButton(buttonDef.label, buttonDef.clickHandler);
                    }, this);
                    buttons = [];
                    return generator;
                },
                getModel: function () {
                    return statefulModel.toPlainObject();
                },
                refresh: function (link) {
                    crudService.exec(link, function (response) {
                        var model = modelHelper.getProperties(modelHelper.getItem(repsonse.item), isEditable);
                        statefulModel = new StatefulModel({data: model});
                        generator.set('children', statefulModel);
                    });
                },
                createButton: function (label, clickHandler) {
                    if (!generator) {
                        buttons.push({
                            label: label,
                            clickHandler: clickHandler
                        });
                        return;
                    }
                    var button = new Button({
                        label: label,
                        style: "float:left"
                    });
                    if (!buttonBar) {
                        buttonBar = domConstruct.create('div', {style: {width: "100%"}}, generator.domNode);
                    }
                    button.placeAt(buttonBar);
                    button.on('Click', clickHandler);
                },
                onNavigate: function (response) {}
            });
        }
    });
});