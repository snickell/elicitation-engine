(function (EAT, ElicitationUtils, window, undefined) {
    "use strict";


    EAT.Widget = Ember.View.extend({
        stateGetPropertyNames: function (maxDepth, includeUndefinedProperties) {
            maxDepth = maxDepth | 8;
            includeUndefinedProperties = includeUndefinedProperties | false;

            function IsComputedPropertyWithNoSetter(obj, prop) {
                var meta = Ember.meta(obj);
                if (meta && meta.descs && meta.descs[prop] && meta.descs[prop].func ) {
                    return meta.descs[prop].func.length < 2;
                } else {
                    return false;
                }
            }

            /* ====================== */

            function getPropertiesFor(widget, maxDepth, includeUndefinedProperties, skipKeys, skipPaths) {
                var alreadyTraversed = new Set([
                    widget,
                    widget.get('definition'),
                    widget.get('data'),
                ]);

                function keys(x) {
                    var keys = Ember.keys(x);
                    if (x && x._stateSkipKeys) {
                        keys = keys.filter(function (key) {
                            return !x._stateSkipKeys.contains(key);
                        });
                    }
                    return keys;
                }

                function getProperties(x, depth, fullPath) {
                    if (depth > maxDepth) return [];

                    return keys(x)
                    .filter(function (key) {
                        return !(key[0] == "@" || key.slice(-7) == "Binding" || skipKeys.has(key));
                    })
                    .map(function (key) {
                        var childPath = fullPath + "." + key;
                        if (skipPaths.has(childPath)) return [];

                        try {
                            var child = Ember.get(x, key);

                            if (typeof child === "string" || typeof child === "number" || typeof child === "boolean" || child === null | (includeUndefinedProperties && child === undefined)) {
                                if (IsComputedPropertyWithNoSetter(x, key)) return []; // we don't want to override a 'read-only' property (i.e. no setter)
                                // JSON value...
                                return [childPath];
                            } else if (Array.isArray(child) || (typeof child === "object" && child instanceof Ember.Object)) {
                                // Don't keep looking at it if we've already traversed the object
                                if (alreadyTraversed.has(child)) return [];
                                alreadyTraversed.add(child);

                                return getProperties(child, depth + 1, childPath);
                            } else {
                                // If its not a JSON value, and its not an Array, and its not an Ember.Object, ignore it!
                                return [];
                            }
                        } catch (e) {
                            console.log("Couldn't get " + childPath, e);
                            return [];
                        }

                    })
                    .filter(function (x) { return x && x.length > 0; })
                    .reduce(function (a, b) {
                        return a.concat(b);
                    }, []);
                }

                var defProps = getProperties(widget.get('definition'), 0, "definition");
                var dataProps = getProperties(widget.get('data'), 0, "data");
                return defProps.concat(dataProps);
            }

            /* ================= */
            var skipPaths = new Set(this.statePathsToSkip());
            var skipKeys = new Set(this.stateKeyNamesToSkip());

            return getPropertiesFor(this, maxDepth, includeUndefinedProperties, skipKeys, skipPaths);
        },
        lastSerializedData: function () {
            // FIXME: this is slow, it requires the elicitation to serialized/deserialize the entire property
            // tree per-widget call..... optimize this sometime if stateSave / stateResume are too slow
            return this.get('elicitation').getSerializedDataFor(this.get('dataKey'));
        }.property().volatile(),
        stateSave: function () {
            return {
                'properties': this.getProperties(this.stateGetPropertyNames()),
                'serializedData': this.get('lastSerializedData')
            };
        },
        resumeFromSerializedData: function (serializedData) {},
        stateResume: function (state) {
            this.setProperties(state.properties);
            this.resumeFromSerializedData(state.serializedData);

            if (this.afterStateResume) {
                this.afterStateResume();
            }

            this.redraw();
        },
        stateKeyNamesToSkip: function () {
            return ['schema', 'propertiesAndValues'];
        },
        statePathsToSkip: function () {
            return ['definition.schema', 'definition.visibleWhens', 'definition.variables'];
        },
        classNameBindings: [':elicitation-widget-view', 'conditionallyHidden', 'hasQualificationsToShow'],
        serializedDefinition: null,
        definition: undefined,
        data: null,
        qualifications: function () {
            var widget = this;
            return EAT.qualifications.map(function (qualification) {
                return qualification.create({
                    widget: widget
                });
            });
        }.property('elicitation.qualifications'),
        qualificationsToShow: function () {
            return this.get('qualifications').filterProperty('showQualification', true);
        }.property('qualifications.@each.showQualification'),
        hasQualificationsToShow: function () {
            return this.get('qualificationsToShow').length > 0;
        }.property('qualificationsToShow'),
        layoutName: "widget-layout",
        dataModel: EAT.WidgetData,
        fixmeWatchVariables: function () {
            this.get('elicitation').notifyPropertyChange('variables');
        }.observes('definition.variables.@each'),
        addExtraPropertiesToSchema: function (schema) {
            // Now add schema properties common to ALL widgets
            schema.addProperty("visibleWhens", EAT.SchemaProperty.create({
                type: "HasMany",
                category: "Variables",
                prettyName: 'Visible-When',
                accessor: EAT.WidgetDefinition.HasMany('visible-when', {
                    model: EAT.WidgetDefinition.extend({
                        condition: "SomeVariableName > 30.5",
                        formulaResult: undefined
                    }),
                    condition: { accessor: EAT.WidgetDefinition.Attr("condition"), type: "Formula" }
                })
            }));

            schema.addProperty("variables", EAT.SchemaProperty.create({
                type: "HasMany",
                category: "Variables",
                prettyName: 'Variable',
                accessor: EAT.WidgetDefinition.HasMany('variable', {
                    model: WidgetVariable.extend({ widget: this }),
                    name: { accessor: EAT.WidgetDefinition.Attr("name"), type: "String" },
                    property: { accessor: EAT.WidgetDefinition.Contents(), type: "String" }
                })
            }));

            schema.addProperty("id", EAT.SchemaProperty.create({
                type: "String",
                prettyName: 'id',
                visible: false,
                accessor: EAT.WidgetDefinition.Attr("id")
            }));

            schema.addProperty(
                "hideOptionalQualifications",
                EAT.SchemaProperty.create({
                    type: "Boolean",
                    category: "Default Qualifications",
                    prettyName: "Hide Qualify Your Answer",
                    accessor: EAT.WidgetDefinition.Attr("hideOptionalQualifications")
                })
            );

            schema.addProperty(
                "responseIsOptional",
                EAT.SchemaProperty.create({
                    type: "Boolean",
                    prettyName: "Response is Optional",
                    accessor: EAT.WidgetDefinition.Attr("responseIsOptional")
                })
            );

            // Add qualifications
            this.get('qualifications').forEach(function (qualification) {
                schema.addProperty(
                    qualification.propertyName,
                    EAT.SchemaProperty.create({
                        type: "Boolean",
                        category: "Default Qualifications",
                        prettyName: qualification.prettyName,
                        accessor: EAT.WidgetDefinition.Attr(qualification.xmlAttr)
                    })
                );
            });
        },
        _widget_OnInit: function () {
            Ember.assert("widget.elicitation must be set to an elicitation", !Ember.isNone(this.get('elicitation')));

            // Initialize Widget.data
            this.set('data', this.get('dataModel').create({ widget: this, definitionBinding: "widget.definition" }));

            // Initialize the Widget.definition object from the Widget.definitionSchema
            var schemaHash = this.get('definitionSchema');
            Ember.assert("Widget must have a definitionSchema set", !Ember.isNone(schemaHash));
            var schema = EAT.Schema.createFromHash(schemaHash);

            // FIXME: ideally, rather than using a MIXIN, we would require all widgets to inherit
            // their definitionModel(s) from the RootWidgetDefinition class
            var rootModel = schema.get('definitionModel').extend(RootWidgetDefinition, {});
            schema.set('definitionModel', rootModel);

            this.addExtraPropertiesToSchema(schema);

            var definition = schema.createDefinition(this, this.get('serializedDefinition'));
            this.set('definition', definition);

            // Call the widget's init method (until we resolve how to chain .on('init') handlers
            this.initWidget();
        }.on('init'),
        initWidget: function () { /* TO BE OVERRIDDEN BY WIDGETS */ },
        conditionallyHidden: function () {
            var elicitation = this.get('elicitation');

            var visibleWhens = this.get('definition.visibleWhens.content');

            var visible = true;
            if (!Ember.isNone(visibleWhens) && visibleWhens.length > 0) {
                visibleWhens.forEach(function (visibleWhen) {
                    var variableScope = elicitation.get('variableScope');
                    // console.log("Doing eval in context", variableScope);

                    try {
                        visible = visible && ElicitationUtils.evalInScope(visibleWhen.condition, variableScope);
                        visibleWhen.set('formulaResult', visible);
                    } catch (e) {
                        visibleWhen.set('formulaResult', e.toString());
                    }
                });
            }
            return !visible;
        }.property('definition.visibleWhens.@each.condition', 'elicitation.variableScope'),
        scrollTo: function () {
            var widget = this;
            window.setTimeout(function () {
                var domElement = widget.$();
                $.scrollTo(domElement, 300, {
                    offset: { top: -60 },
                    axis: 'y'
                });
            }, 50);
        },
        definitionSchema: null,
        description: function () {
            return this.getDefinitionTag();
        }.property(),
        definitionEditorViewClass: function () {
            return EAT.WidgetDefinitionEditorView;
        }.property(),
        definitionEditorView: function () {
            return this.get('definitionEditorViewClass').create({
                definition: this.get('definition'),
                widget: this
            });
        }.property('definition', 'definitionEditorViewClass').volatile(),
        getDefinitionTag: function () {
            return this.get('definitionTag');
        },
        serializeDefinition: function (doc) {
            var tag = this.getDefinitionTag();
            var serialized = $(doc.createElement(tag));
            var definition = this.get('definition');
            definition.serialize(serialized);
            return serialized;
        },
        serializedMetadata: function () {
            var metadata = EAT.SerializedData.create();

            this.get('qualificationsToShow').forEach(function (qualification) {
                var propertyName = qualification.get('propertyName');
                var result = qualification.get('serializedData');
                metadata.set(propertyName, result);
            });

            return metadata;
        }.property().volatile(),
        responseIsOptional: Ember.computed.alias('definition.responseIsOptional'),
        serializedData: function () {
            var data = EAT.SerializedData.create();
            var errors = [];

            if (!Ember.isNone(this.serializeData)) {
                this.serializeData(data, errors);
            } else {
                return null;
            }

            // Now store metadata, like qualifications
            data.set('metadata', this.get('serializedMetadata'));

            if (this.get('responseIsOptional')) {
                errors = [];
            }

            return EAT.StoreDataResult.create({
                data: data,
                errors: errors
            });
        }.property().volatile(),
        dataKeyBinding: 'definition.id',
        dataKeyTextBinding: 'definition.dataKeyText',
        redraw: function () { },
        didInsertElement: function () {
            this.setupDOM();
        },
        setupDOM: function () {
        },
        focusSelector: null,
        beforeEnteringPage: function (page) {},
        beforeExitingPage: function (page) {}
    });

    EAT.Widget.reopenClass({
        register: function (definitionTag, def) {
            def['definitionTag'] = definitionTag;

            var newWidget = this.extend(def);
            newWidget.reopenClass({
                definitionTag: definitionTag,
                prettyName: def.prettyName,
                widgetResults: def.widgetResults
            });

            EAT.definitionDOMElements.addObject(definitionTag);
            EAT.Widgets[definitionTag] = newWidget;
            return newWidget;
        }
    });

    // This mixin is applied to the ROOT definition object, i.e. widget.definition
    var RootWidgetDefinition = Ember.Mixin.create({
        _id: undefined,
        id: function (key, val) {
            if (arguments.length > 1) {
                this.set('_id', val);
            }
            var id = this.get('_id');
            if (Ember.isNone(id)) {
                id = ElicitationUtils.makeUUID();
                this.set('_id', id);
            }
            return id;
        }.property('_id')
    });

    var allArrows = new RegExp("→", 'g');
    var WidgetVariable = EAT.WidgetDefinition.extend({
        widget: undefined, // bind
        elicitationBinding: 'widget.elicitation',
        name: "SomeVariableName",
        property: undefined,
        value: function () {
            try {
                var serializedData = this.get('elicitation.serializedData');
                if (Ember.isNone(serializedData)) {
                    throw "elicitation.serializedData was null";
                }

                var widget = this.get('widget');
                var widgetData = this.get('elicitation.serializedData').getDataForWidget(widget);
                
                var property = this.get('property');

                // Arrows are the "technically valid" syntax, and eventually, we'll want to do this as a
                // recusive series of get() calls, NOT using Ember's auto-recurse. The reason is that we
                // may (conceivably) have property names that include a period (oops), for example, the
                // series names in a time-trend are directly stored as-is.
                property = property.replace(allArrows, ".");

                return widgetData ? Ember.get(widgetData, property) : undefined;
            } catch (e) {
                console.log("Error getting widget value: ", e);
                return undefined;
            }
        }.property('elicitation.serializedData', 'widget.dataKey', 'property'),
        watchValue: function () {
            // FIXME: do we really need to do this fetch? probably was working around an
            // ember bug, forcing value to compute because deeper observers weren't working
            // ... might not be relevant anymore? needs testing.
            var value = this.get('value');
            //console.log("Variable ", this.get('name'), "=", value);
        }.observes('value')
    });

})(EAT, ElicitationUtils, window);