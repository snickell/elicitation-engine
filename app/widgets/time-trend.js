import './time-trend.css';

import Ember from 'ember'
import EAT from 'eat/eat'

import ElicitationUtils from 'eat/elicitation-utils'
import { Widget } from 'eat/widget'
import { WidgetDefinition } from 'eat/widget-definition'
import { WidgetData } from 'eat/widget-data'
import { WidgetResultsViewRegistry, WidgetResultsView, WidgetResultsData } from 'eat/widget-results';

var DEBUG_TIME_TREND = false;
var TIME_TREND_UNDEFINED_POINT_OFFSET = -15;

/*

perExpertData[].expertID
perExpertData[].data.Expected[]
perExpertData[].data.Min[]
perExpertData[].data.Max[]

perExpertData[].data.Expected[].x
perExpertData[].data.Expected[].y

*/

WidgetResultsViewRegistry.TimeTrend = WidgetResultsView.extend({
    templateName: "time-trend-results",
    classNames: ["widget-results", "time-trend"],
    content: undefined, // An EAT.WidgetResultsData
    googleAvailable: false,
    dataTableAndFriends: function () {
        var dataTable = new google.visualization.DataTable();
        dataTable.addColumn({ type: 'number', label: 'Year', pattern: "####" });

        var columnsToFormat = new Ember.Set();

        /* SETUP THE ROWS */
        var xValueToRowNum = {};

        var allXValues = this.get('allX').toArray().sort();
        dataTable.addRows(allXValues.get('length'));

        allXValues.forEach(function (x, i) {
            dataTable.setCell(i, 0, x /*new Date('1/1/' + x.toString())*/, null);
            xValueToRowNum[x] = i;
        });


        var colNumsToFormat = [];

        var seriesNameToColumnNums = {};
        var expertIDToColumnNums = {};
        var columnNumToExpertID = {};
        var seriesNames = new Ember.Set();
        var expertIDs = new Ember.Set();


        /* SETUP THE COLUMNS */
        this.get('perExpertData').forEach(function (perExpertData) {
            var expertID = perExpertData.expertID;
            var data = perExpertData.data;

            for (var seriesName in data) {
                if (seriesName != 'metadata' && data.hasOwnProperty(seriesName)) {
                    // First we add a column for this expert<->seriesName pair
                    var minOrMaxSeries = false; // FIXME: to implement
                    var role = minOrMaxSeries ? 'interval' : 'data'; // If its a min/max series, it should be an interval role

                    var colNum = dataTable.addColumn({
                        type: 'number',
                        label: seriesName /*+ " - Expert " + expertID*/,
                        role: role,
                        pattern: '@@##',
                    });
                    colNumsToFormat.push(colNum);

                    // Add it to the seriesNameToColumnNums tracker...
                    if (Ember.isNone(seriesNameToColumnNums[seriesName])) {
                        seriesNameToColumnNums[seriesName] = [];
                    }
                    seriesNameToColumnNums[seriesName].push(colNum);
                    seriesNames.add(seriesName);

                    // Add it to the expertIDToColumnNums tracker...
                    if (Ember.isNone(expertIDToColumnNums[expertID])) {
                        expertIDToColumnNums[expertID] = [];
                    }
                    expertIDToColumnNums[expertID].push(colNum);
                    expertIDs.add(expertID);

                    columnNumToExpertID[colNum] = expertID;

                    // Now we set the data for the column...
                    var seriesPoints = data[seriesName];
                    seriesPoints.forEach(function (seriesPoint) {
                        var rowNum = xValueToRowNum[seriesPoint.x];
                        if (!Ember.isNone(rowNum)) {
                            dataTable.setCell(rowNum, colNum, seriesPoint.y, null);
                        }
                    });
                }
            }

        });

        // Reformat numbers in the tooltip, we do this down here because it gets
        // messed up if we add data later...
        var formatter = new google.visualization.NumberFormat({
            pattern: '##.##'
        });
        colNumsToFormat.forEach(function (colNum) {
            formatter.format(dataTable, colNum);
        });

        return {
            dataTable: dataTable,
            seriesNameToColumnNums: seriesNameToColumnNums,
            expertIDToColumnNums: expertIDToColumnNums,
            columnNumToExpertID: columnNumToExpertID,
            seriesNames: seriesNames,
            expertIDs: expertIDs
        };
    }.property('allX', 'perExpertData'),
    didInsertElement: function () {
        this._super();

        var chartDiv = this.$("div.google-chart-holder");
        var self = this;

        google.load("visualization", "1", {
            packages: ["corechart"],
            callback: function () {

                var chart = new google.visualization.LineChart(chartDiv.get(0));

                var options = {
                    pointSize: 5,
                    focusTarget: 'datum',
                    backgroundColor: '#707580',
                    titlePosition: 'none',
                    vAxis: {
                        viewWindowMode: 'pretty',
                        textStyle: { color: 'white' },
                        gridlines: { color: '#888' },
                        baselineColor: '#707580'
                    },
                    tooltip: { trigger: 'selection' },
                    hAxis: {
                        format: '####',
                        viewWindowMode: 'pretty',
                        textStyle: { color: 'white' },
                        gridlines: { color: '#888' },
                        baselineColor: '#707580'
                    },
                    theme: 'maximized'
                };

                var dataTableAndFriends = self.get('dataTableAndFriends');

                // Now assign each series to a color...
                var seriesColors = ['#19b5eb', 'rgb(217,76,116)', 'rgb(123,105,209)', 'rgb(235,136,35)', 'rgb(76,166,73)', 'rgb(64,133,198)', 'rgb(228,81,39)', 'rgb(90,86,196)', 'rgb(168,206,56)', 'rgb(255,205,5)', 'rgb(16,147,128)', 'rgb(154,61,168)'];
                var seriesOptions = {};
                dataTableAndFriends.seriesNames.forEach(function (seriesName) {
                    var seriesColor = seriesColors.shift(); // snag a color for this series...

                    var firstInSeries = true;

                    // Assign it to all relevant columns
                    dataTableAndFriends.seriesNameToColumnNums[seriesName].forEach(function (dataTableColumnNum) {
                        var seriesNum = dataTableColumnNum - 1; // The first column is a label...
                        var seriesOption = { color: seriesColor, visibleInLegend: false };
                        if (firstInSeries) {
                            seriesOption['visibleInLegend'] = true;
                            firstInSeries = false;
                        }
                        seriesOptions[seriesNum] = seriesOption;
                    });
                });
                
                options['series'] = seriesOptions;

                chart.draw(dataTableAndFriends.dataTable, options);
                debug.googleChart = chart;
                debug.googleChartDataTable = dataTableAndFriends.dataTable;
                self.set('googleAvailable', true);

                // When we hover over a point, select ALL that expert's points!
                google.visualization.events.addListener(chart, 'onmouseover', function (hoverOver) {
                    if (hoverOver.column != null) {
                        var columnNum = hoverOver.column;
                        var expertID = dataTableAndFriends.columnNumToExpertID[columnNum];

                        var expertColumns = dataTableAndFriends.expertIDToColumnNums[expertID];
                        var selection = expertColumns.map(function (columnNum) {
                            return { column: columnNum };
                        });
                        chart.setSelection(selection);
                    }
                });

            }
        });
    },
    expertIDs: function () {
        var perExpertData = this.get('content.perExpertData');
        return perExpertData.mapProperty('expertID').map(function (e) { return e.toString(); });
    }.property('content.perExpertData'),
    data: function () {
        var perExpertData = this.get('content.perExpertData');

        debug.perExpertData = perExpertData;

        return perExpertData.mapProperty('data');
    }.property('content.perExpertData'),
    seriesNames: function () {
        var data = this.get('data');
        var seriesNames = Ember.Set.create();
        data.forEach(function (expertData) {
            for (var key in expertData) {
                if (expertData.hasOwnProperty(key)) {
                    seriesNames.add(key);
                }
            }
        });
        seriesNames.remove('metadata');
        return seriesNames.toArray();
    }.property('data'),
    series: function () {
        var data = this.get('data');
        var seriesNames = this.get('seriesNames');

        var notNull = function (point) { return !Ember.isNone(point); };

        var series = {};
        seriesNames.forEach(function (seriesName) {
            series[seriesName] = data.mapProperty(seriesName).filter(notNull);
        });

        return series;
    }.property('data', 'seriesNames'),
    allPoints: function () {
        var series = this.get('series');
        var seriesNames = this.get('seriesNames');

        var allPoints = [];

        var addSeriesToAllPoints = function (series) {
            series.forEach(function (p) {
                allPoints.push(p);
            });
        };

        seriesNames.forEach(function (seriesName) {
            series[seriesName].forEach(addSeriesToAllPoints);
        });

        // FIXME: HARDCODED-SERIES
        // series.Expected.forEach(addSeriesToAllPoints);
        // series.Max.forEach(addSeriesToAllPoints);
        // series.Min.forEach(addSeriesToAllPoints);

        return allPoints;
    }.property('series'),
    allX: function () {
        return new Ember.Set(this.get('allPoints').mapProperty('x'));
    }.property('allPoints'),
    allY: function () {
        return new Ember.Set(this.get('allPoints').mapProperty('y'));
    }.property('allPoints'),
    minX: function () {
        return Math.min.apply(Math, this.get('allX'));
    }.property('allX'),
    maxX: function () {
        return Math.max.apply(Math, this.get('allX'));
    }.property('allX'),
    minY: function () {
        return Math.min.apply(Math, this.get('allY'));
    }.property('allY'),
    maxY: function () {
        return Math.max.apply(Math, this.get('allY'));
    }.property('allY')
});


EAT.TimeTrendPointView = Ember.View.extend({
    didInsertElement: function () {
        var widget = this;
        function b(f) {
            return function () {
                f.apply(widget, arguments);
            }
        }

        if (!this.get('point.fixedValue')) {
            this.$().draggable({
                axis: "y",
                start: function () { widget.set('frame.pointBeingDragged', widget) },
                stop: function (evt, ui) { widget.updateModelFromCSS(evt, ui); widget.set('frame.pointBeingDragged', null); },
                drag: b(this.updateModelFromCSS)
            });
            // boxPlot.find("#median").draggable({ axis: "x", containment: box, stop: b(this.updateModelValuesFromPixelPositions) });
        }
        this.colorChanged();
    },
    colorChanged: function () {
        this.$(".dot").css('background-color', this.get('point.color'));
    }.observes('point.color'),
    updateModelFromCSS: function (evt, ui) {
        var frame = this.get('frame');
        var point = this.get('point');
        point.setProperties({
            //year: frame.fromPixelX(ui.position.left),
            value: frame.fromPixelY(ui.position.top)
        });

        // FIXME: BAD!!! bad bad bad cross band signalling, but works around the lack of proper
        // recursive notifications in EmberJS (hopefully a bug that will be fixed soon... damnit?)
        //window.setTimeout(function () {
        frame.notifyPropertyChange('pointsChanged');
    },
    classNames: ["point"],
    classNameBindings: ["point.fixedValue", "point.isNextUndefinedPoint", "point.isUndefined", "point.draggingOutOfBounds"],
    templateName: "time-trend-point",
    attributeBindings: ["style"],
    style: function () {
        var frame = this.get('frame');

        if (Ember.isNone(frame)) return;

        window.debugFrame = frame;
        var x = parseFloat(this.get('point.x'));
        var y = parseFloat(this.get('point.y'));

        var top = TIME_TREND_UNDEFINED_POINT_OFFSET;
        var left;

        if (!isNaN(y)) {
            top = frame.toPixelY(y);
        }

        left = frame.toPixelX(x);
        var style = "top: " + top + "px; left: " + left + "px";

        return style;
    }.property('point.x', 'point.y', 'frame.coordsChanged')
});

EAT.TimeTrendSeriesView = Ember.View.extend({
    classNameBindings: [":series", "series.isVisible", "series.isCurrentSeries", "series.complete"],
    attributeBindings: ["title"],
    titleBinding: "series.name"
});

var SeriesModel = WidgetDefinition.extend({
    onInit: function () {
        this.set('points', Ember.A(this.get('points')));
    }.on('init'),
    color: "#19b4eb",
    name: undefined,
    startingPoint: undefined, // a point "not in the series" that determines where drawing starts
    points: undefined,
    reversePoints: function () {
        return this.get('points').copy().reverse();
    }.property('points'),
    virtualSeries: false,
    isVisible: function () {
        return this.get('isComplete') || this.get('isCurrentSeries');
    }.property('isComplete', 'isCurrentSeries'),
    isComplete: function () {
        return Ember.isNone(this.get('nextUndefinedPoint'));
    }.property('points.@each.isUndefined'),
    nextUndefinedPoint: function () {
        return this.get('points').findProperty('isUndefined');
    }.property('points.@each.isUndefined'),

    /* frame should /only/ be used for isCurrentSeries */
    frame: undefined,
    isCurrentSeries: function () {
        return this.get('frame.currentSeries') == this;
    }.property('frame.currentSeries'),
    labelStyle: function () {
        return "color: " + this.get('color');
    }.property('color'),
    fillBetweenRelativePoints: false
});

var PointModelKeyProperties = ['year', 'label', 'value', 'fixedValue', 'series'];
var PointModel = WidgetDefinition.extend(Ember.Copyable, {
    copy: function () {
        return PointModel.create(this.getProperties(PointModelKeyProperties));
    },
    label: "",
    x: function () {
        return parseFloat(this.get('year'));
    }.property('year'),
    y: function () {
        return parseFloat(this.get('value'));
    }.property('value'),
    year: 2012,
    value: 1.0,
    fixedValue: false,
    isAdjustable: function () {
        return !this.get('fixedValue');
    }.property('fixedValue'),
    series: undefined,
    isNextUndefinedPoint: function () {
        return this == this.get('series.nextUndefinedPoint');
    }.property('series', 'series.nextUndefinedPoint'),
    isUndefined: function () {
        return isNaN(parseFloat(this.get('year'))) || isNaN(parseFloat(this.get('value')));
    }.property('year', 'value'),
    draggingOutOfBounds: false,
    color: function () {
        if (this.get('isAdjustable')) {
            return this.get('series.color');
        } else {
            return "rgb(128,128,128)";
        }
    }.property('series.color', 'isAdjustable')
});

var RelativePointModel = PointModel.extend({
    relativeTo: undefined, // another PointModel
    relativeValueMin: undefined,
    relativeValueMax: undefined,
    relativeValue: undefined,
    yearBinding: 'relativeTo.year',
    value: function (key, val) {
        var relativeToValue = this.get('relativeTo.y');

        if (arguments.length > 1) {
            var relativeValue = parseFloat(val) - relativeToValue;

            var outOfBounds = false;
            var relativeValueMin = this.get('relativeValueMin');
            if (!Ember.isNone(relativeValueMin) && relativeValue < relativeValueMin) {
                relativeValue = relativeValueMin;
                outOfBounds = true;
            }

            var relativeValueMax = this.get('relativeValueMax');
            if (!Ember.isNone(relativeValueMax) && relativeValue > relativeValueMax) {
                relativeValue = relativeValueMax;
                outOfBounds = true;
            }

            this.set('draggingOutOfBounds', outOfBounds);
            this.set('relativeValue', relativeValue);
        }

        return relativeToValue + this.get('relativeValue');
    }.property('relativeValue', 'relativeTo', 'relativeTo.value')
});

function setupSeries(seriesModel, definitionPoints, requestRange, labelPrefix, allSeries) {
  var points = definitionPoints.map(function (existingPoint) {
      return Ember.copy(existingPoint).set('series', seriesModel);
  });
  
  seriesModel.set('points', points);
  
  allSeries.push(seriesModel);
  
  if (requestRange) {
      var frame = seriesModel.get('frame');
      var minMaxSeries = createMinAndMaxSeries(points, frame, labelPrefix);
      allSeries.push(minMaxSeries.max);
      allSeries.push(minMaxSeries.min);
  }
}

function createMinAndMaxSeries(points, frame, labelPrefix) {
    var adjustablePoints = points.filter(function (point) { return !point.fixedValue });

    var startingPoint = undefined;
    if (adjustablePoints.length > 0) {
        startingPoint = points[points.indexOf(adjustablePoints[0]) - 1];
        if (Ember.isNone(startingPoint)) {
            startingPoint = points[0];
        }
    }

    var maxSeries = SeriesModel.create({
        name: labelPrefix + "Max",
        title: "The maximuum value you can imagine",
        virtualSeries: true,
        frame: frame,
        color: '#ebb419',
        startingPoint: startingPoint,
        fillBetweenRelativePoints: true
    });
    maxSeries.set('points', adjustablePoints.map(function (point) {
        return RelativePointModel.create({
            relativeTo: point,
            relativeValueMin: 0,
            series: maxSeries
        });
    }));

    var minSeries = SeriesModel.create({
        name: labelPrefix + "Min",
        title: "The minimuum value you can imagine",
        virtualSeries: true,
        frame: frame,
        color: '#19ebb4',
        startingPoint: startingPoint,
        fillBetweenRelativePoints: true
    });
    minSeries.set('points', adjustablePoints.map(function (point) {
        return RelativePointModel.create({
            relativeTo: point,
            relativeValueMax: 0,
            series: minSeries
        });
    }));

    window.debugMax = maxSeries;
    window.debugPoints = points;

    return {
        min: minSeries,
        max: maxSeries
    }
}

function isInteger(num) {
    return num == Math.round(num);
}

var TimeTrendFrameModel = Ember.Object.extend({
    renderingUsingExCanvas: false,
    widget: undefined,
    definitionBinding: 'widget.definition',
    pointBeingDragged: null,
    aPointIsBeingDragged: function () {
        return !Ember.isNone(this.get('pointBeingDragged'));
    }.property('pointBeingDragged'),
    pointBeingDraggedYStatus: function () {
        var point = this.get('pointBeingDragged');
        if (Ember.isNone(point)) return "";

        var y = point.get('point.y');
        var range = this.get('modelRangeY');

        // FIXME: set the number of decimal points based on modelRangeY

        return parseFloat(y).toFixed(2);
    }.property('modelRangeY', 'pointBeingDragged.point.y'),
    allX: function () {
        return new Ember.Set(this.get('allPoints').mapProperty('x'));
    }.property('allPoints'),    
    everyXIsInteger: function () {
        var xValues = this.get('allX');
        return xValues.every(isInteger);  
    }.property('allX'),
    theFrameIsBeingScaled: false,
    series: function () {
        var allSeries = Ember.A([]);
        var frame = this;


        var model = SeriesModel.create({
            name: this.get('definition.seriesLabel'),
            title: "The value you expect",
            frame: frame
        });
        
        setupSeries(model, this.get('definition.points'), this.get('definition.requestRange'), "", allSeries);

        // Add in the extra series
        var colors = ['#ebb419', '#98ef05', '#f00098', '#2349F0', '#39F034'];
        this.get('definition.series').forEach(function (series) {
            var label = series.get('label');

            var model = SeriesModel.create({
                name: label,
                title: "",
                frame: frame,
                color: colors.pop()
            });
            
            setupSeries(model, series.get('points'), series.get('requestRange'), label + "", allSeries);
        });

        return allSeries;
    }.property('definition.seriesLabel', 'definition.points', 'definition.requestRange', 'definition.pointsChanged', 'definition.series.@each',
                'definition.series.@each.pointsChanged', 'definition.series.@each.requestRange', 'definition.series.@each.label'),
    currentSeries: function () {
        return this.get('series').find(function (series) {
            return !series.get('isComplete');
        });
    }.property('series.@each.isComplete'),
    dom: undefined,
    frameDOM: function () {
        return this.get('dom').find(".frame");
    }.property('dom'),

    axisCanvas: function () {
        // we don't do canvas#axis because of a quirk with IE8 selectors and
        // non-valid elements (it doesn't know what a canvas is... yet)
        return this.get('frameDOM').find("canvas").filter("#axis")[0];
    }.property('frameDOM').volatile(),
    linesCanvas: function () {
        // we don't do canvas#axis because of a quirk with IE8 selectors and
        // non-valid elements (it doesn't know what a canvas is... yet)
        return this.get('frameDOM').find("canvas").filter("#lines")[0];
    }.property('frameDOM').volatile(),
    minPixelX: 20,
    maxPixelX: undefined,
    minPixelY: 2,
    maxPixelY: undefined,

    minModelX: 2000,
    maxModelX: 2030,
    minModelY: 0.0,
    maxModelY: 1.2,

    modelRangeHasBeenSet: false,

    /* Axis Scaling Code Here */
    setModelRange: function (toRange) {
        var valueAxisMinUpperRange = parseFloat(this.get('definition.valueAxisMinUpperRange'));
        if (!isNaN(valueAxisMinUpperRange)) {
            toRange.maxModelY = Math.max(valueAxisMinUpperRange, toRange.maxModelY);
        }

        var valueAxisMaxLowerRange = parseFloat(this.get('definition.valueAxisMaxLowerRange'));
        if (!isNaN(valueAxisMaxLowerRange)) {
            toRange.minModelY = Math.min(valueAxisMaxLowerRange, toRange.minModelY);
        }

        var frame = this;

        // Don't animate changes if we're using the rather slow exCanvas fallback for IE7 and IE8
        var animateChange = this.get('modelRangeHasBeenSet') && !this.get('renderingUsingExCanvas');
        this.set('modelRangeHasBeenSet', true);

        if (animateChange) {
            this.set('theFrameIsBeingScaled', true);

            var fromRange = this.getProperties('minModelX', 'maxModelX', 'minModelY', 'maxModelY');
            $(fromRange).animate(toRange, {
                duration: 1000,
                step: function () {
                    frame.setProperties(this);
                    frame.notifyPropertyChange('coordsChanged');
                },
                complete: function () {
                    frame.set('theFrameIsBeingScaled', false);
                    frame.setProperties(this);
                    frame.notifyPropertyChange('coordsChanged');
                }
            });
        } else {
            frame.setProperties(toRange);
            frame.notifyPropertyChange('coordsChanged');
        }
    },
    extremePointsChanged: function () {
        // Don't scale while dragging points
        if (this.get('aPointIsBeingDragged')) return;

        if (this.get('allPoints.length') < 1) {
            this.setModelRange({
                minModelX: 0,
                maxModelX: 10,
                minModelY: 0,
                maxModelY: 1
            });
            return;
        }

        var minPointX = this.get('minPointX');
        var maxPointX = this.get('maxPointX');
        var minPointY = this.get('minPointY');
        var maxPointY = this.get('maxPointY');

        if (isNaN(minPointX)) minPointX = 0;
        if (isNaN(maxPointX)) maxPointX = 10;
        if (isNaN(minPointY)) minPointY = 0;
        if (isNaN(maxPointY)) maxPointY = 1;

        var rangeX = maxPointX - minPointX;
        var rangeY = maxPointY - minPointY;

        var offsetX = rangeX * 0.1;
        var offsetY = rangeY * 0.2;

        if (minPointX === maxPointX) {
            offsetX = 4;
        }

        if (minPointY === maxPointY) {
            offsetY = 4;
        }

        this.setModelRange({
            minModelX: minPointX - offsetX,
            maxModelX: maxPointX + offsetX,
            minModelY: minPointY - offsetY,
            maxModelY: maxPointY + (offsetY * 2)
        });
    }.observes('minPointX', 'maxPointX', 'minPointY', 'maxPointY', 'aPointIsBeingDragged', 'definition.timeAxisLogBase', 'definition.valueAxisLogBase').on('init'),
    allPoints: function () {
        var points = this.get('series').reduce(function (list, series) {
            return list.concat(series.get('points'));
        }, []);
        
        // Wrap in an Ember.Array so allPoints.@each observers work
        return Ember.A(points);
    }.property('pointsChanged', 'series'),
    mostExtremePoint: function (comparison) {
        var mostExtreme = undefined;
        this.get('allPoints').forEach(function (item) {
            if (mostExtreme == undefined || comparison(item, mostExtreme)) {
                mostExtreme = item;
            }
        });
        return mostExtreme;
    },
    minPointX: function () {
        return this.mostExtremePoint(function (one, two) { return one.get('x') < two.get('x'); }).get('x');
    }.property('allPoints', 'allPoints.@each.x'),
    minPointY: function () {
        return this.mostExtremePoint(function (one, two) { return one.get('y') < two.get('y'); }).get('y');
    }.property('allPoints', 'allPoints.@each.y'),
    maxPointX: function () {
        return this.mostExtremePoint(function (one, two) { return one.get('x') > two.get('x'); }).get('x');
    }.property('allPoints', 'allPoints.@each.x'),
    maxPointY: function () {
        return this.mostExtremePoint(function (one, two) { return one.get('y') > two.get('y'); }).get('y');
    }.property('allPoints', 'allPoints.@each.y'),

    pixelRangeX: function () {
        return this.get('maxPixelX') - this.get('minPixelX');
    }.property('minPixelX', 'maxPixelX'),
    pixelRangeY: function () {
        return this.get('minPixelY') - this.get('maxPixelY');
    }.property('minPixelY', 'maxPixelY'),

    modelRangeX: function () {
        return this.get('maxModelX') - this.get('minModelX');
    }.property('minModelX', 'maxModelX'),
    modelRangeY: function () {
        return this.get('maxModelY') - this.get('minModelY');
    }.property('minModelY', 'maxModelY'),

    // We use a notify on these to observe changes in one gulp
    // this is a bad hack, but it works around the lack of properly functioning recursive observes
    // in EmberJS 0.9.8.1
    coordsChanged: undefined,
    pointsChanged: undefined,

    scale: function (x, logBase) {
        // adjust model value by log scale, if relevant on this axis
        if (logBase > 1) {
            var sign = x >= 0 ? 1 : -1;
            return sign * Math.log(Math.abs(x)) / Math.log(logBase);
        } else {
            return x;
        }            
    },

    fromPixel: function (pixelVal, pixelOffset, pixelRange, minModel, maxModel, logBase) {            
        var pixelPercent = (pixelVal - pixelOffset) / pixelRange;
        var scaledMinModel = this.scale(minModel, logBase);
        var scaledRange = this.scale(maxModel, logBase) - scaledMinModel;
        var unscaledResult = pixelPercent * scaledRange + scaledMinModel;
        if (logBase > 1) {
            return Math.pow(logBase, unscaledResult);
        } else {
            return unscaledResult;
        }
    },

    fromPixelX: function (pixelX) {
        return this.fromPixel(pixelX, this.get('minPixelX'), this.get('pixelRangeX'), this.get('minModelX'), this.get('maxModelX'), parseFloat(this.get('definition.timeAxisLogBase')));
    },
    fromPixelY: function (pixelY) {
        return this.fromPixel(pixelY, this.get('maxPixelY'), this.get('pixelRangeY'), this.get('minModelY'), this.get('maxModelY'), parseFloat(this.get('definition.valueAxisLogBase')));
    },        
    toPixel: function (modelVal, maxModel, minModel, pixelRange, offsetPixel, logBase) {
        var modelRange = this.scale(maxModel, logBase) - this.scale(minModel, logBase);
        var modelPercent = (this.scale(modelVal, logBase) - this.scale(minModel, logBase)) / modelRange;
        
        return Math.round(modelPercent * pixelRange + offsetPixel);
    },
    
    toPixelX: function (modelX) {
        return this.toPixel(modelX, this.get('maxModelX'), this.get('minModelX'), this.get('pixelRangeX'), this.get('minPixelX'), parseFloat(this.get('definition.timeAxisLogBase')));
    },
    toPixelY: function (modelY) {
        return this.toPixel(modelY, this.get('maxModelY'), this.get('minModelY'), this.get('pixelRangeY'), this.get('maxPixelY'), parseFloat(this.get('definition.valueAxisLogBase')));
    }
});

var pointsDef = {
    type: "HasMany",
    prettyName: 'Point',
    emphasizeWhenEmpty: true,
    accessor: WidgetDefinition.HasMany('point', {
        model: PointModel,
        year: { accessor: WidgetDefinition.Attr("year"), prettyName: "Year (X)" },
        value: { accessor: WidgetDefinition.Attr("value"), prettyName: "Default Value (Y)", helpText: "Leave blank to start with an undefined y-value (recommended)" },
        fixedValue: {
            accessor: WidgetDefinition.Attr("fixed-value"),
            type: "Boolean",
            prettyName: "Value isn't user adjustable",
            helpText: "The point is fixed at authoring time and experts cannot move it, e.g. use for historical or reference points."
        },
        label: { accessor: WidgetDefinition.Attr("label"), prettyName: "Label the point", helpText: "Add an annotation to the point" }
    })
};

Widget.register('time-trend', {
    prettyName: "Time Trend",
    templateName: 'time-trend',
    widgetResults: WidgetResultsViewRegistry.TimeTrend,
    dataModel: WidgetData.extend({
    }),
    definitionSchema: {
        model: WidgetDefinition.extend({
            pointsChanged: undefined, // used to signal when any aspect of a point changes, since we make a copy in frame.series
            informWhenPointsChange: function () {
                this.notifyPropertyChange('pointsChanged');
            }.observes('points.@each.year', 'points.@each.value', 'points.@each.fixedValue', 'points.@each.label'),
            valueAxisLabel: "Weight in Kg",
            seriesLabel: "Expected"
        }),
        label: { accessor: WidgetDefinition.ChildNode("label"), type: "Text" },
        requestRange: {
            accessor: WidgetDefinition.Attr("request-range"),
            prettyName: "Also request Min and Max series",
            type: "Boolean"
        },
        valueAxisLabel: {
            accessor: WidgetDefinition.Attr("value-axis-label"),
            prettyName: "Value (Y) Axis Label",
            type: "String"
        },
        timeAxisLabel: {
            accessor: WidgetDefinition.Attr("time-axis-label"),
            prettyName: "Time (X) Axis Label",
            type: "String"
        },
        seriesLabel: {
            accessor: WidgetDefinition.Attr("series-label"),
            prettyName: "Series Label",
            type: "String"
        },
        points: pointsDef,
        valueAxisMinUpperRange: {
            accessor: WidgetDefinition.Attr("value-axis-min-upper-range"),
            prettyName: "Min Upper",
            type: "String",
            category: "Y-Axis Range"
        },
        valueAxisMaxLowerRange: {
            accessor: WidgetDefinition.Attr("value-axis-max-lower-range"),
            prettyName: "Max Lower",
            type: "String",
            category: "Y-Axis Range"
        },
        valueAxisLogBase: {
            accessor: WidgetDefinition.Attr("value-axis-log-base"),
            prettyName: "Y-Axis Log Base",
            type: "String",
            category: "Y-Axis Range"
        },            
        timeAxisLogBase: {
            accessor: WidgetDefinition.Attr("time-axis-log-base"),
            prettyName: "X-Axis Log Base",
            type: "String",
            category: "Y-Axis Range"
        },
        series: {
            type: "HasMany",
            prettyName: 'Series',
            accessor: WidgetDefinition.HasMany('series', {
                model: WidgetDefinition.extend({
                    label: "A Series",
                    pointsChanged: undefined, // used to signal when any aspect of a point changes, since we make a copy in frame.series
                    informWhenPointsChange: function () {
                        this.notifyPropertyChange('pointsChanged');
                    }.observes('points.@each.year', 'points.@each.value', 'points.@each.fixedValue', 'points.@each.label')
                }),
                label: { accessor: WidgetDefinition.Attr("label"), prettyName: "Series Label" },
                points: pointsDef,
                requestRange: {
                    accessor: WidgetDefinition.Attr("request-range"),
                    prettyName: "Also request Min and Max series",
                    type: "Boolean"
                }
            })
        },
        fillBetweenMinAndMaxYValues: {
            accessor: WidgetDefinition.Attr("fill-between-min-and-max-y-values"),
            prettyName: "Draw a fill between min and max y values, across all series",
            type: "Boolean"
        },        
    },
    initWidget: function () {
        this._super();
        var frame = TimeTrendFrameModel.create({ widget: this });
        this.set('frame', frame);
        this.set('data.frame', frame);
    },
    afterStateResume: function () {
        this.get('frame').notifyPropertyChange("pointsChanged");
    },
    serializeData: function (data, errors) {
        /* We serialize using the format:

        {
          "SeriesName1": [
             { x: 5, y: 10 },
             { x: 7, y: 15 },
             ...
          ],
          "SeriesName2" : [
            ...
          ],
          ...
        }

        */

        this.get('frame.series').forEach(function (series) {
            var seriesName = ElicitationUtils.escapeForEmberProperty(series.get('name'));

            if (!series.get('isComplete')) {
                errors.pushObject("Series '" + seriesName + "' has undragged points");
            }

            data.set(seriesName,
                series.get('points').filterProperty('isAdjustable').map(function (point) {
                    return point.getProperties('x', 'y');
                })
            );
        });
    },
    redraw: function () {
        var frame = this.get('frame');
        var frameDOM = frame.get('frameDOM');

        var model = this.get('data');
        var definition = this.get('definition');

        // Draw in the axis on the canvas
        var axis = frameDOM.find("canvas#axis");
        var axisCanvas = axis.get(0);
        var width = axisCanvas.width = axis.width() || frameDOM.width(); // we use the || to deal with cases (like IE7) where the DOM element is zero-sized
        var height = axisCanvas.height = axis.height() || frameDOM.height();

        var lines = frameDOM.find("canvas#lines");
        var linesCanvas = lines.get(0);
        linesCanvas.width = lines.width() || frameDOM.width();
        linesCanvas.height = lines.height() || frameDOM.height();

        frame.setProperties({
            maxPixelX: width - 60,
            maxPixelY: height - 20 // gives space for axis labels at the bottom
        });

        // We use this to inform clients that they should redraw
        frame.notifyPropertyChange('coordsChanged');
    },
    frame: undefined,
    setupDOM: function () {
        this.set('frame.dom', this.$());
        this.set('haveSetupDOM', true);

        // Need to initialze exCanvas, c.f. "IE Sux"
        if (window.G_vmlCanvasManager != undefined) {
            var frame = this.get('frame');

            var axisCanvas = frame.get("axisCanvas");
            var linesCanvas = frame.get("linesCanvas");

            axisCanvas = ElicitationUtils.recreateCanvasElement(axisCanvas);
            linesCanvas = ElicitationUtils.recreateCanvasElement(linesCanvas);

            window.G_vmlCanvasManager.initElement(axisCanvas);
            window.G_vmlCanvasManager.initElement(linesCanvas);
            frame.set('renderingUsingExCanvas', true);
        }

        this.redraw();
    },
    drawConnectingLines: function () {
        var CONNECTING_LINE_CANVAS_OFFSET = 30; // this canvas reaches into the undefined territory in order to capture lines

        var frame = this.get('frame');
        if (Ember.isNone(frame) || !this.get('haveSetupDOM')) return;

        var canvas = frame.get("linesCanvas");
        var ctx = canvas.getContext("2d");

        var series = this.get('frame.series');
        
        var fillBetweenMinAndMaxPoints = this.get('definition.fillBetweenMinAndMaxYValues');

        var minPixelX = frame.toPixelX(frame.minModelX);
        var minPixelY = frame.toPixelY(frame.minModelY);
        var maxPixelX = frame.toPixelX(frame.maxModelX);
        var maxPixelY = frame.toPixelY(frame.maxModelY);

        function getXFor(point) {
            var x = parseFloat(point.get('x'));

            if (isNaN(x)) {
                x = -15;
            } else {
                x = frame.toPixelX(x);
            }

            return x;
        }

        function getYFor(point) {
            var y = parseFloat(point.get('y'));

            if (isNaN(y)) {
                y = TIME_TREND_UNDEFINED_POINT_OFFSET;
            } else {
                y = frame.toPixelY(y);
            }

            return y;
        }

        ctx.save(); {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.translate(0, CONNECTING_LINE_CANVAS_OFFSET);
            
            if (fillBetweenMinAndMaxPoints) {
                var maxY = {};
                var minY = {};
                                
                // Find extreme Y values (across all series)
                series.forEach(function (series) {
                    series.get('points').forEach(function (point) {
                        var x = parseFloat(point.get('x'));
                        var y = parseFloat(point.get('y'));
                        
                        if (!isNaN(y) && !isNaN(x)) {
                            if (maxY[x] === undefined || y > maxY[x]) {
                                maxY[x] = y;
                            }
                            if (minY[x] === undefined || y < minY[x]) {
                                minY[x] = y;
                            }
                        }
                        
                    });
                });
                
                // Now order the x values
                var pointsMax = Object.keys(maxY)
                    .map(function (xVal) { return { 
                        x: frame.toPixelX(xVal), 
                        y: frame.toPixelY(maxY[xVal])
                    }})
                    .sort(function (a, b) { return a.x - b.x; });
                var pointsMin = Object.keys(minY)
                    .map(function (xVal) { return { 
                        x: frame.toPixelX(xVal), 
                        y: frame.toPixelY(minY[xVal])
                    }})                    
                    .sort(function (a, b) { return b.x - a.x; });
                var points = pointsMax.concat(pointsMin);
                
                
                if (points.length > 0) {
                    var startingPoint = points[0];
                    
                    ctx.moveTo(startingPoint.x, startingPoint.y);
                    points.forEach(function (point) {
                        ctx.lineTo(point.x,point.y);
                    });                    
                    ctx.lineTo(startingPoint.x, startingPoint.y);

                    ctx.fillStyle = "rgba(255,255,0,0.2)";
                    ctx.fill();                    
                }
            }

            series.forEach(function (series) {

                if (!series.get('isVisible')) return;

                ctx.beginPath();
                //ctx.moveTo(minPixelX, minPixelY);

                var lastX, lastY = undefined;
                var lastPointWasUndefined = false;

                var startingPoint = series.get('startingPoint');
                if (!Ember.isNone(startingPoint)) {
                    lastX = getXFor(startingPoint);
                    lastY = getYFor(startingPoint);
                }

                series.get('points').forEach(function (point) {
                    var x = getXFor(point);
                    var y = getYFor(point);

                    var pointIsUndefined = point.get('isUndefined');
                    if (lastX != undefined && lastY != undefined) {
                        if (point.get('isAdjustable')) {
                            ctx.strokeStyle = series.get('color');
                            ctx.lineWidth = 3;
                        } else {
                            ctx.strokeStyle = "#333";
                            ctx.lineWidth = 2;
                        }

                        ctx.beginPath();

                        if (pointIsUndefined || lastPointWasUndefined) {
                            dashedLine(ctx, lastX, lastY, x, y);
                            ctx.lineWidth = 1;
                        } else {
                            ctx.moveTo(lastX, lastY);
                            ctx.lineTo(x, y);
                        }
                        ctx.stroke();
                    }
                    lastX = x;
                    lastY = y;
                    lastPointWasUndefined = pointIsUndefined;
                });

                // Should we fill against another series?
                var otherSeries = series.get('fillBetweenRelativePoints');
                if (!Ember.isNone(otherSeries)) {
                    if (!Ember.isNone(startingPoint)) {
                        ctx.moveTo(getXFor(startingPoint), getYFor(startingPoint));
                    }

                    var points = series.get('points').filterProperty('isUndefined', false).filterProperty('relativeTo');

                    // First add a line along the points in our series
                    points.forEach(function (point) {
                        ctx.lineTo(getXFor(point), getYFor(point));
                    });

                    // Now add a line (in reverse order) along the relativeTo points
                    points.slice().reverse().mapProperty('relativeTo').forEach(function (point) {
                        if (Ember.isNone(point)) return;
                        ctx.lineTo(getXFor(point), getYFor(point));
                    });

                    ctx.fillStyle = "rgba(255,255,0,0.2)";
                    ctx.fill();
                }
            });

        } ctx.restore();
    }.observes('frame.coordsChanged', 'frame.pointsChanged'),
    drawGrid: function (ctx, min, max, minPixelY, maxPixelY, modelToPixelXFunc, textTransform, integerXAxis) {
        var GRID_COLOR = "rgb(200,200,200)";

        ctx.save(); {
            ctx.lineWidth = 1;
            ctx.strokeStyle = GRID_COLOR;

            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.font = "12pt Helvetica";

            var range = max - min;
            var scale = Math.round(log10(range));
            var tickSize = Math.pow(10, scale);
            
            var majorTickEvery = 1;

            var minNumTicks = 9;
            var maxNumMajorTicks = 15;

            if (range / tickSize < minNumTicks) {
                tickSize /= 10;
                scale--;
            }
            if (range / tickSize < minNumTicks) {
                tickSize /= 2;
                scale--;
            }
            
            if (integerXAxis && !isInteger(tickSize)) {
                tickSize = Math.ceil(tickSize);
                scale = 0;
            }


            if (range / tickSize > maxNumMajorTicks) {
                majorTickEvery *= 2;
            }
            
            
            

            var majorTickSize = tickSize * majorTickEvery;
            var start = Math.round(min / majorTickSize) * majorTickSize;


            var numTicksSinceMajor = 0;
            for (var modelX = start; modelX < max; modelX += tickSize) {
                var pixelX = modelToPixelXFunc(modelX);

                var majorTick = numTicksSinceMajor >= majorTickEvery;
                if (majorTick) numTicksSinceMajor = 0;
                numTicksSinceMajor++;

                // Don't draw ticks too close to the arrowheads
                //if (pixelX < 15 || pixelX > width - 15) continue;

                ctx.save(); {
                    var lengthOffset = 0;

                    if (majorTick) {
                        ctx.beginPath();
                        ctx.moveTo(pixelX, minPixelY);
                        ctx.lineTo(pixelX, maxPixelY);
                        ctx.lineWidth = 1;
                        ctx.stroke();

                        ctx.save(); {
                            textTransform(ctx, pixelX, minPixelY);

                            var tickLabel;
                            if (scale < 1) {
                                tickLabel = modelX.toFixed(Math.abs(scale));
                            } else {
                                tickLabel = modelX.toFixed();
                            }
                            
                            ctx.fillText(tickLabel, 0, 5);
                        } ctx.restore();
                    } else {
                        // option to draw minor ticks here
                        /*
                        ctx.beginPath();
                        ctx.moveTo(0,0);
                        ctx.lineTo(0,TICK_LENGTH - 2*lengthOffset);
                        ctx.stroke();
                        */
                    }
                } ctx.restore();
            }

        } ctx.restore();

    },
    drawAxis: function () {
        var frame = this.get('frame');
        if (Ember.isNone(frame) || !this.get('haveSetupDOM')) return;

        var canvas = frame.get("axisCanvas");
        var ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Axis Draw Settings
        var AXIS_COLOR = "black";
        var TICK_LENGTH = 15;

        var minPixelX = frame.toPixelX(frame.minModelX);
        var minPixelY = frame.toPixelY(frame.minModelY);
        var maxPixelX = frame.toPixelX(frame.maxModelX);
        var maxPixelY = frame.toPixelY(frame.maxModelY);

        function b(self, f) {
            return function () {
                return f.apply(self, arguments);
            }
        }

        var textTransform = function (ctx, pixelX, pixelY) {
            ctx.translate(pixelX, pixelY);
        }

        var everyXIsInteger = frame.get('everyXIsInteger');

        // Draw the x grid and labels
        this.drawGrid(ctx, frame.minModelX, frame.maxModelX, minPixelY, maxPixelY, b(frame, frame.toPixelX), textTransform, everyXIsInteger);

        // Draw the y grid and labels by rotating 90 degrees
        ctx.save(); {
            ctx.translate(maxPixelX, 0);
            ctx.rotate(Math.PI / 2.0);
            var textTransform = function (ctx, pixelX, pixelY) {
                ctx.translate(pixelX, pixelY);
                ctx.rotate(-Math.PI / 2.0);
                ctx.translate(20, -15);
            }
            this.drawGrid(ctx, frame.minModelY, frame.maxModelY, 0, maxPixelX - minPixelX, b(frame, frame.toPixelY), textTransform, false);

            // Draw a darker line at zero
            ctx.beginPath();
            var zero = frame.toPixelY(0);
            ctx.moveTo(zero, 0);
            ctx.lineTo(zero, maxPixelX - minPixelX);
            ctx.lineWidth = 1;
            ctx.strokeStyle = "rgb(64,64,64)";
            ctx.stroke();
        } ctx.restore();

        ctx.save(); {
            ctx.strokeStyle = AXIS_COLOR;
            ctx.lineCap = 'round';
            ctx.lineWidth = 2;

            ctx.beginPath();

            ctx.moveTo(minPixelX, minPixelY);
            ctx.lineTo(maxPixelX, minPixelY);
            ctx.lineTo(maxPixelX, maxPixelY);
            ctx.lineTo(minPixelX, maxPixelY);
            ctx.closePath();

            ctx.stroke();

            var max = frame.maxModelX;
            var min = frame.minModelX;
        } ctx.restore();
    }.observes('frame.coordsChanged')
});

function log10(val) {
    return Math.log(val) / Math.log(10);
}


var dashedLine = function (ctx, x, y, x2, y2, da) {
    if (!da) da = [10, 5];
    ctx.save();
    var dx = (x2 - x), dy = (y2 - y);
    var len = Math.sqrt(dx * dx + dy * dy);
    var rot = Math.atan2(dy, dx);
    ctx.translate(x, y);
    ctx.moveTo(0, 0);
    ctx.rotate(rot);
    var dc = da.length;
    var di = 0, draw = true;
    x = 0;
    while (len > x) {
        x += da[di++ % dc];
        if (x > len) x = len;
        draw ? ctx.lineTo(x, 0) : ctx.moveTo(x, 0);
        draw = !draw;
    }
    ctx.restore();
};
