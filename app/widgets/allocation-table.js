(function (EAT, Ember) {
    "use strict;"
 
 

    EAT.WidgetResultsViews.AllocationTable = EAT.WidgetResultsView.extend({
        templateName: "allocation-table-results",
        classNames: ["widget-results", "allocation-table"],
        content: undefined, // An EAT.WidgetResultsData


/*

    "data": {
        "a Electricity generation and storage": {
          "Allocation (%)": 30
        },
        "b Transportation": {
          "Allocation (%)": 20
        },
        "c Industrial use": {
          "Allocation (%)": 20
        },
        "d Agriculture": {
          "Allocation (%)": 10
        },
        "e Energy system efficiency": {
          "Allocation (%)": 20
        },
        "metadata": {}
    },

*/

        dataTableAndFriends: function () {
            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn({
                type: 'string'
            });

            var seriesNames = new Ember.Set();
            var seriesNameToColNum = {};

            //var expertNum = 0;
            this.get('content.perExpertData').mapProperty('data').forEach(function (data) {
                console.log("allocation-table-results-chart for data row:", data);
                var expertNum = dataTable.addRow();

                // set X position to expertNum
                dataTable.setCell(expertNum, 0, expertNum.toString());

                for (var seriesNameA in data) {
                    if (seriesNameA != 'metadata' && data.hasOwnProperty(seriesNameA)) {
                        for (var seriesNameB in data[seriesNameA]) {
                            if (data[seriesNameA].hasOwnProperty(seriesNameB)) {
                                console.log("a=", seriesNameA, ", b=", seriesNameB);
                                var value = data[seriesNameA][seriesNameB];

                                var seriesName = seriesNameA + ", " + seriesNameB;
                                var colNum = null;
                                if (!seriesNames.contains(seriesName)) {
                                    console.log("new name " + seriesName + ": adding");
                                    seriesNames.add(seriesName);
                                    colNum = dataTable.addColumn({
                                        type: 'number',
                                        label: seriesName
                                        /*role: role,
                                        pattern: '@@##',*/
                                    });
                                    seriesNameToColNum[seriesName] = colNum;
                                } else {
                                    colNum = seriesNameToColNum[seriesName];
                                }

                                dataTable.setCell(expertNum, colNum, value);
                            }
                        }
                    }
                }
            });

            console.log("Returning allocation-table results data table");

            return {
                dataTable: dataTable,
                seriesNameToColNum: seriesNameToColNum,
                seriesNames: seriesNames
            }
        }.property('content.perExpertData'),


      
        didInsertElement: function () {
            this._super();

            var chartDiv = this.$("div.google-chart-holder");
            var self = this;

            google.load("visualization", "1", {
                packages: ["corechart"],
                callback: function () {

                    var chart = new google.visualization.LineChart(chartDiv.get(0));

                    var options = {
                        lineWidth: 0,
                        pointSize: 5,
                        //focusTarget: 'datum',
                        backgroundColor: '#707580',
                        titlePosition: 'none',
                        vAxis: {
                            viewWindowMode: 'pretty',
                            textStyle: { color: 'white' },
                            gridlines: { color: '#888' },
                            baselineColor: '#707580'
                        },
                        //tooltip: { trigger: 'selection' },
                        hAxis: {
                            format: '#',
                            viewWindowMode: 'pretty',
                            textStyle: { color: 'white' },
                            gridlines: { color: '#888' },
                            baselineColor: '#707580'
                        },
                        theme: 'maximized'
                    };

                    var dataTableAndFriends = self.get('dataTableAndFriends');
                    window.dataTableAndFriends = dataTableAndFriends;

                    // Now assign each series to a color...
                    var seriesColors = ['#19b5eb', 'rgb(217,76,116)', 'rgb(123,105,209)', 'rgb(235,136,35)', 'rgb(76,166,73)', 'rgb(64,133,198)', 'rgb(228,81,39)', 'rgb(90,86,196)', 'rgb(168,206,56)', 'rgb(255,205,5)', 'rgb(16,147,128)', 'rgb(154,61,168)'];
                    var seriesOptions = {};
                    dataTableAndFriends.seriesNames.forEach(function (seriesName) {
                        var seriesColor = seriesColors.shift(); // snag a color for this series...
                        var colNum = dataTableAndFriends.seriesNameToColNum[seriesName];
                        seriesOptions[colNum] = { color: seriesColor };
                    });

                    options['series'] = seriesOptions;

                    chart.draw(dataTableAndFriends.dataTable, options);
                    debug.googleChart = chart;
                    debug.googleChartDataTable = dataTableAndFriends.dataTable;
                    self.set('googleAvailable', true);

                }
            });
        }
    });

 
    $.widget("nz.dragdistance", $.ui.mouse, {
        options: {
            drag: null,
            start: null,
            stop: null
        },
        _create: function () {
            this.element.disableSelection();
            this._mouseInit();
        },
        _mouseStart: function (event) {
            this.startEvent = event;
            if (this.options.start) {
                this.options.start();
            }
        },
        _getDist: function (event) {
            var x = event.screenX - this.startEvent.screenX;
            var y = event.screenY - this.startEvent.screenY;
            var dist = Math.sqrt(x * x + y * y);
            return event.screenY < this.startEvent.screenY ? dist : -dist;
        },
        _mouseDrag: function (event) {
            if (this.options.drag) {
                this.options.drag(this._getDist(event));
            }
        },
        _mouseStop: function (event) {
            if (this.options.stop) {
                this.options.stop(this._getDist(event));
            }
            this.startEvent = null;
        }
    });

    var GraphicView = Ember.View.extend({
        templateName: "allocation-table-cell-graphic",
        content: null,
        classNameBindings: [":graphic-holder"],
        inserted: false,
        didInsertElement: function () {
            this.set('inserted', true);

            var self = this;
            var startingAllocated;
            var dragtest = this.$().dragdistance({
                drag: function (dist) {
                    dist /= 2.0;
                    self.set('content.allocated', startingAllocated + dist);
                },
                start: function () {
                    startingAllocated = self.get('content.allocated');
                },
                stop: function (dist) {
                    startingAllocated = null;
                }
            });
        },
        holderElement: function () {
            if (!this.get('inserted')) return undefined;
            return this.$();
        }.property('inserted'),
        holderWidth: function () {
            var element = this.get('holderElement');
            return Ember.isNone(element) ? undefined : element.width();
        }.property('holderElement'),
        makeHolderHeightMatchWidth: function () {
            var holderElement = this.get('holderElement');
            var holderWidth = this.get('holderWidth');
            if (!(Ember.isNone(holderElement) || Ember.isNone(holderWidth))) {
                holderElement.height(holderWidth);
            }
        }.observes('holderWidth'),
        maxGraphicWidthBinding: 'holderWidth',
        maxAllocatedBinding: 'content.table.maxAllocated',
        graphicSizePx: function () {
            var maxGraphicWidth = this.get('maxGraphicWidth');
            var allocated = this.get('content.allocated');
            var maxAllocated = this.get('maxAllocated');

            var ratio = allocated / maxAllocated;
            return ratio * maxGraphicWidth;
        }.property('maxGraphicWidth', 'maxAllocated', 'content.allocated'),
        graphicStyle: function () {
            var graphicSizePx = this.get('graphicSizePx');

            var style = ""
                + "width: " + graphicSizePx + "px;"
                + "height: " + graphicSizePx + "px;";
            return style;
        }.property('graphicSizePx')
    });

    var CellView = Ember.View.extend({
        templateName: 'allocation-table-cell',
        content: null,
        tagName: "td",
        graphicalInputBinding: "content.table.dataModel.graphicalInput",
        classNameBindings: [':cell', 'content.allocatedStringIsInvalid', 'content.locked', 'graphicalInput'],
        toggleLocked: function () {
            this.toggleProperty('content.locked');
        },
        graphicView: GraphicView,
        allocatedTextField: Ember.TextField.extend({
            precision: null, /* bound to CellView.CellModel.allocatedStringPrecision */
            valueBinding: 'allocated',
            focused: false,
            observeValueWhileFocused: function () {
                if (this.get('focused')) {
                    var value = this.get('value');
                    this.set('allocated', value);

                    // CHANGE allocatedStringPrecision (bound to precision)
                    // if we have manually input more precision than is permitted
                    // for other cells. The +1 adds one extra digit, so that
                    // divisions are reflected.
                    var sigFigs = ElicitationUtils.countSigFigs(value)+1;
                    var precision = this.get('precision');
                    if (precision < sigFigs) {
                        this.set('precision', sigFigs);
                    }
                }
            }.observes('value'),
            focusIn: function (evt) {
                this.set('focused', true);
                this.get('valueBinding').disconnect(this);
            },
            focusOut: function (evt) {
                this.set('focused', false);

                var value = this.get('value');
                this.get('valueBinding').connect(this);
                this.set('value', value);
            }
        })
    });

    var SummationCellView = CellView.extend({
        tagName: "td",
        classNameBindings: [':summation']
    });

    var AllocatedStringMixin = Ember.Mixin.create({
        allocatedStringPrecision: undefined,
        allocatedStringIsInvalid: false,
        allocatedString: function (key, val) {
            this.set('allocatedStringIsInvalid', false);
            if (arguments.length > 1) {
                var number = parseFloat(val);
                if (!isNaN(number)) {
                    this.set('allocated', number);
                } else {
                    this.set('allocatedStringIsInvalid', true);
                }
            }
            var num = this.get('allocated');
            var precision = this.get('allocatedStringPrecision');
            return ElicitationUtils.toSigFig(num, precision);
        }.property('allocated', 'numDigitsPrecision')
    });

    var CellModel = Ember.Object.extend(AllocatedStringMixin, {
        allocatedStringPrecisionBinding: 'table.allocatedStringPrecision',
        _stateSkipKeys: ['col', 'row', 'table', 'allocationStringPrecision'],
        col: null,
        row: null,
        table: null,
        allocated: 0,
        locked: false
    });


    function sumProperty(enumerable, propName) {
        return enumerable.mapProperty(propName).reduce(function (sum, item) {
            return sum + item;
        }, 0);
    }

    var SumChildAllocated = Ember.Mixin.create(AllocatedStringMixin, {
        deepChildrenBinding: 'children',
        unlockedChildren: function () {
            return this.get('deepChildren').rejectProperty('locked');
        }.property('deepChildren.@each.locked'),
        allocated: function (key, newAllocated) {
            if (arguments.length > 1) {
                if (newAllocated != 0.0) {
                    var currentAllocated = sumProperty(this.get('deepChildren'), 'allocated');
                    var difference = newAllocated - currentAllocated;

                    var unlockedChildren = this.get('unlockedChildren');
                    var unlockedAllocated = sumProperty(unlockedChildren, 'allocated');

                    if (unlockedAllocated != 0) {
                        var newUnlockedAllocated = unlockedAllocated + difference;
                        var ratio = newUnlockedAllocated / unlockedAllocated;

                        unlockedChildren.forEach(function (child) {
                            child.set('allocated', child.get('allocated') * ratio);
                        });
                    } else {
                        var childValue = difference / unlockedChildren.get('length');
                        unlockedChildren.setEach('allocated', childValue);
                    }
                }
            }

            return sumProperty(this.get('children'), 'allocated');
        }.property('children.@each.allocated'),
        locked: function (key, value) {
            if (arguments.length > 1) {
                this.get('deepChildren').setEach('locked', value);
            }
            return this.get('deepChildren').everyProperty('locked');
        }.property('deepChildren.@each.locked')
    });

    var RowModel = Ember.Object.extend(SumChildAllocated, {
        _stateSkipKeys: ['locked', 'allocated', 'label'],
        definition: null,
        labelBinding: 'definition.label',
        childrenBinding: 'cells',
        allocatedStringPrecisionBinding: 'table.allocatedStringPrecision'
    });


    var ColModel = Ember.Object.extend(SumChildAllocated, {
        definition: null,
        labelBinding: 'definition.label',
        childrenBinding: 'cells',
        allocatedStringPrecisionBinding: 'table.allocatedStringPrecision'
    });


    var TableModel = Ember.Object.extend(SumChildAllocated, {
        allocatedStringPrecisionBinding: 'dataModel.allocatedStringPrecision',
        childrenBinding: "rows",
        deepChildrenBinding: 'cells',
        cells: function () {
            var cells = this.get('rows').mapProperty('cells').reduce(function (toReturn, rowCells) {
                return toReturn.concat(rowCells);
            }, []);
            return cells;
        }.property('rows.@each.cells.@each'),
        maxAllocated: function () {
            var minMax = 20; // FIXME: for demo only, set to null to have no minMax, and solve some other way
            return this.get('cells').mapProperty('allocated').reduce(function (max, allocated) {
                return max != null && max > allocated ? max : allocated;
            }, minMax);
        }.property('cells.@each.allocated')
    });

    var AllocationTableDataModel = EAT.WidgetData.extend(AllocatedStringMixin, {
        allocatedStringPrecision: 2,
        table: null,
        graphicalInput: false,
        init: function () {
            this._super();

            this.set('table', EAT.WidgetData.CreateTable({
                dataModel: this,
                rowDefinitionsBinding: 'dataModel.definition.rows',
                colDefinitionsBinding: 'dataModel.definition.cols',
                rowModel: RowModel,
                colModel: ColModel,
                cellModel: CellModel,
                tableModel: TableModel
            }));
        },
        totalAllocationBinding: 'definition.totalAllocation',
        allocated: Ember.computed.alias('table.allocated'),
        fullyAllocated: function () {
            var toAllocate = this.get('toAllocate');
            return (toAllocate <= 0.0000000000001) && (toAllocate >= -0.0000000000001);
        }.property('toAllocate'),
        toAllocate: function () {
            return this.get('totalAllocation') - this.get('allocated');
        }.property('allocated', 'totalAllocation')
    });

    EAT.Widget.register('allocation-table', {
        prettyName: "Allocation Table",
        templateName: 'allocation-table',
        widgetResults: EAT.WidgetResultsViews.AllocationTable,        
        dataModel: AllocationTableDataModel,
        definitionSchema: {
            model: EAT.WidgetDefinition.extend({
                totalAllocation: 100
            }),
            label: { accessor: EAT.WidgetDefinition.ChildNode('label'), type: "Text" },
            totalAllocation: {
                accessor: EAT.WidgetDefinition.Attr('total-allocation'),
                prettyName: "Allocation",
                type: "String"
            },
            unitSuffix: { accessor: EAT.WidgetDefinition.Attr("unit-suffix"), prettyName: "Units", helpText: "Units for the value being allocated, e.g. the 'kg' in 50kg" },
            unitPrefix: { accessor: EAT.WidgetDefinition.Attr("unit-prefix"), prettyName: "Prefix for Units", helpText: "Prefix to the value being allocated, e.g. the '$' in $50m" },
            cols: {
                type: "HasMany",
                prettyName: 'Col',
                emphasizeWhenEmpty: true,
                accessor: EAT.WidgetDefinition.HasMany('column', {
                    model: EAT.WidgetDefinition.extend({
                        label: 'untitled col'
                    }),
                    label: { accessor: EAT.WidgetDefinition.ChildNode('label') }
                })
            },
            rows: {
                type: "HasMany",
                prettyName: 'Row',
                emphasizeWhenEmpty: true,
                accessor: EAT.WidgetDefinition.HasMany('row', {
                    model: EAT.WidgetDefinition.extend({
                        label: 'untitled row'
                    }),
                    label: { accessor: EAT.WidgetDefinition.ChildNode('label') }
                })
            }
        },
        initWidget: function () {
            this._super();
            window.debugAllocationTable = this;
        },
        //row
        setupDOM: function () {
        },
        serializeData: function (data, errors) {
            var table = this.get('data.table');

            table.get('rows').forEach(function (row) {
                var colValues = {};
                row.get('cells').forEach(function (cell) {
                    var colPropertyName = ElicitationUtils.escapeForEmberProperty(cell.get('col.definition.label'));
                    colValues[colPropertyName] = cell.get('allocated');
                });

                var rowPropertyName = ElicitationUtils.escapeForEmberProperty(row.get('definition.label'));
                data.set(rowPropertyName, colValues);
            });

            if (!this.get('data.fullyAllocated')) {
                var totalAllocation = data.get('totalAllocation');
                var allocated = data.get('allocated');
                errors.pushObject("You allocated " + allocated + ", but the requested allocation was " + totalAllocation);
            }
        },
        stateKeyNamesToSkip: function () {
            return this._super().concat(['allocatedStringIsInvalid', 'allocatedString', 'allocatedStringPrecision', '__each', 'deepChildren']);
        },
        statePathsToSkip: function () {
            return this._super().concat(['data.table.cols', 'data.table.locked', 'data.table.allocated', 'data.totalAllocation', 'data.allocated'])
        },
        showRowSums: function () {
            return this.get('data.table.cols.length') > 1;
        }.property('data.table.cols.length'),
        showColSums: function () {
            return this.get('data.table.rows.length') > 1;
        }.property('data.table.rows.length'),
        cellView: CellView,
        summationCellView: SummationCellView,
        actions: {
          scaleToTotal: function () {
              var value = this.get('data.totalAllocation');
              this.set('data.table.allocatedString', value);
          }          
        }
    });
})(EAT, Ember);