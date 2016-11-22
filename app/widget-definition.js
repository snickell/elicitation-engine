import Ember from 'ember'
import EAT from './eat'
import ElicitationUtils from './elicitation-utils'


var WidgetDefinition = Ember.Object.extend({
    schema: null,
    label: "What is your question?",
    categories: function () {
        var propsAndValues = this.get('propertiesAndValues');
        var categories = {};
        var categoryNames = Ember.Set.create();
        propsAndValues.forEach(function (propAndValue) {
            var category = propAndValue.get('property.category');
            var props = Ember.A(categories[category]);
            props.pushObject(propAndValue);
            categories[category] = props;
            categoryNames.push(category);
        });
        return categoryNames.toArray().sort().map(function (categoryName) {
            return {
                name: categoryName,
                propertiesAndValues: categories[categoryName],
                defaultCategory: categoryName === ""
            }
        });
    }.property('schema', 'propertiesAndValues'),
    propertiesAndValues: function () {
        var schemaProperties = this.get('schema.properties');
        var props = [];
        for (var i = 0; i < schemaProperties.length; i++) {
            var property = schemaProperties[i];
            props.pushObject(Ember.Object.create({
                property: property,
                definition: this,
                valueBinding: 'definition.' + property.get('name')
            }));
        }
        return props;
    }.property('schema'),
    serialize: function (toElement) {
        var schemaProperties = this.get('schema.properties').filter(function (property) { return !(property.get('dontSerialize') == true) });
        for (var i = 0; i < schemaProperties.length; i++) {
            var property = schemaProperties[i];
            var value = this.get(property.get('name'));

            property.get('accessor').serialize(toElement, value);
        }
    },
    dataKeyTextBinding: 'label',
    dataKey: function () {
        var dataKeyText = this.get('dataKeyText');
        if (!dataKeyText) {
            console.log("WARNING: this widget has no dataKey() attribute, nor a dataKeyText() attribute defined to make a dataKey from. Data loss will probably occur");
        }
        return EAT.makeDataKeyFromText(dataKeyText);
    }.property('dataKeyText')
});

WidgetDefinition.reopenClass({
    HasManyArray: Ember.ArrayController.extend(),
    ChildNode: function (tagName) {
        EAT.definitionDOMElements.addObject(tagName);

        tagName = tagName.toLowerCase();
        return {
            loadFromDefinition: function (parent, def) {
                return def.children(tagName).text();
            },
            serialize: function (def, value) {
                var doc = def[0].ownerDocument;
                var newTag = $(doc.createElement(tagName));
                newTag.text(value);
                def.append(newTag);
            }
        }
    },
    Attr: function (attrName) {
        attrName = attrName.toLowerCase();
        return {
            loadFromDefinition: function (parent, def) {
                return def.attr(attrName);
            },
            serialize: function (def, value) {
                def.attr(attrName, value);
            }
        }
    },
    Contents: function () {
        return {
            loadFromDefinition: function (parent, def) {
                // This used to use def.html() on load and serialize
                // but now we're using only the text(), which means
                // all contents must be CDATA. Probably not a problem
                // given the way we /actually/ use this in the EAT
                // but something to be aware of.
                return def.text();
            },
            serialize: function (def, value) {
                // FIXME: might be smart to check that def is all textNodes
                // before we save here
                var doc = def[0].ownerDocument;
                def.append(doc.createTextNode(value));
            }
        }
    },
    HasMany: function (tagName, schemaHash, hasManyModel) {
        EAT.definitionDOMElements.addObject(tagName);
        tagName = tagName.toLowerCase();
        var schema = EAT.Schema.createFromHash(schemaHash);

        if (Ember.isNone(hasManyModel)) hasManyModel = EAT.WidgetDefinition.HasManyArray;

        return {
            getDefault: function () {
                return hasManyModel.create({
                    content: [],
                    schema: schema
                });
            },
            loadFromDefinition: function (parent, def) {
                var many = [];
                def.children(tagName).each(function () {
                    var childSerializedDefinition = $(this);
                    var childDefinition = schema.createDefinition(parent, childSerializedDefinition);
                    many.pushObject(childDefinition);
                });

                return hasManyModel.create({
                    content: many,
                    schema: schema
                });
            },
            serialize: function (def, childDefinitions) {
                var doc = def[0].ownerDocument;

                childDefinitions.forEach(function (childDefinition) {
                    var newTag = $(doc.createElement(tagName));
                    childDefinition.serialize(newTag);
                    def.append(newTag);
                });
            }
        }
    }
});


var WidgetDefinitionEditorView = Ember.View.extend({
    contentBinding: 'definition',
    definition: null,
    templateName: "widget-definition-editor"
});

var WidgetDefinitionEditorCategoryView = Ember.View.extend({
    expanded: false,
    actions: {
        toggleExpanded: function () {
            this.set('expanded', !this.get('expanded'));
        }
    }
});

EAT.WidgetDefinition = WidgetDefinition;
EAT.WidgetDefinitionEditorView = WidgetDefinitionEditorView;
EAT.WidgetDefinitionEditorCategoryView = WidgetDefinitionCategoryView;

export { WidgetDefinition, WidgetDefinitionEditorView, WidgetDefinitionEditorCategoryView };