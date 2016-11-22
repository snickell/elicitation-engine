import Ember from 'ember'
import EAT from './eat'
import ElicitationUtils from './elicitation-utils'

var Schema = Ember.ArrayController.extend({
    init: function () {
        this.set('content', Ember.A(this.get('content')));
    },
    propertiesBinding: 'content',
    definitionModel: EAT.WidgetDefinition,
    createDefinition: function (parent, serializedDefinition) {
        var definition = this.get('definitionModel').create({
            schema: this,
            parent: parent
        });
        var newParent = definition;

        this.forEach(function (property) {
            var propertyAccessor = property.accessor;
            var value = undefined;
            var propName = property.get('name');

            if (Ember.isNone(propertyAccessor)) {
                console.log("WARNING: property '" + propName + "' has no accessor defined in its definitionSchema");
            }


            if (serializedDefinition) {

                value = propertyAccessor.loadFromDefinition(newParent, serializedDefinition);
            }

            if (Ember.isNone(value)) {
                value = definition.get(propName);
                if (Ember.isNone(value) && propertyAccessor.getDefault) {
                    value = propertyAccessor.getDefault();
                }
            }

            // Now cast the property to the correct type
            if (!Ember.isNone(value)) {
                var propType = property.get('type');
                if (propType == "Boolean") {
                    value = value == "true";
                }
            }

            definition.set(propName, value);
        });
        return definition;
    },
    addProperty: function (name, newProperty) {
        newProperty.set('name', name);
        newProperty.set('schema', this);
        this.pushObject(newProperty);
    }
});


EAT.Schema.reopenClass({
    createFromHash: function (schemaHash) {
        var initial = {};
        var schema = EAT.Schema.create();

        for (var propName in schemaHash) {
            if (propName == "model") continue;
            var newProperty = EAT.SchemaProperty.create(schemaHash[propName]);
            schema.addProperty(propName, newProperty);
        }

        if (schemaHash.model) {
            schema.set('definitionModel', schemaHash.model);
        } else {
            schema.set('definitionModel', EAT.WidgetDefinition);
        }

        return schema;
    }
});


var SchemaProperty = Ember.Object.extend({
    name: undefined,
    category: "",
    type: "String",
    emphasizeWhenEmpty: false, // for HasMany SchemaProperties, set to true to freak out if empty
    editorView: function () {
        return EAT.PropertyEditors.get(this.get('type'));
    }.property(),
    prettyName: function () {
        var name = this.get('name');
        return name.charAt(0).toUpperCase() + name.slice(1);
    }.property('name'),
    prettyNamePlural: function () {
        return this.get('prettyName') + "s";
    }.property('prettyName'),
    hasMany: function () {
        return this.get('type') === "HasMany";
    }.property('type'),
    visible: true
});

EAT.Schema = Schema;
EAT.SchemaProperty = SchemaProperty;

export { Schema, SchemaProperty }