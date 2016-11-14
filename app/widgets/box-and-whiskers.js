(function (EAT, Ember, G_vmlCanvasManager) {
    "use strict";

    var DEBUG_BOX_AND_WHISKERS = false;
    var LINE_WIDTH = 7;
    var PERCENTILES = ['_0th', '_25th', '_50th', '_75th', '_100th'];

    EAT.Widget.register('box-and-whiskers', {
        prettyName: "Box n' Whiskers",
        value: null,
        shape: 0,
        scale: 1,
        location: 0,
        doneWithWhiskers: false,
        doneClicking: false,
        templateName: 'box-and-whiskers',
        dataModel: EAT.WidgetData.extend({
            _0th: undefined,
            _25th: undefined,
            _50th: undefined,
            _75th: undefined,
            _100th: undefined,
            percentilesAreDone: function () {
                return !Ember.isNone(this.get('_50th'));
            }.property('_50th')
        }),
        definitionSchema: {
            model: EAT.WidgetDefinition.extend({
                _min: 0.1,
                _max: 4.0,
                min: function (key, value) {
                    if (arguments.length > 1) {
                        this.set('_min', parseFloat(value));
                    } else {
                        return this.get('_min');
                    }
                }.property("_min").volatile(), // FIXME: why are these set volatile ?!? beats the hell out of me
                max: function (key, value) {
                    if (arguments.length > 1) {
                        this.set('_max', parseFloat(value));
                    } else {
                        return this.get('_max');
                    }
                }.property("_max").volatile(),
                axisLabel: "Axis Label (kg)",
                label0th: "Minimum",
                label25th: "25th Percentile",
                label50th: "Median",
                label75th: "75th Percentile",
                label100th: "Maximum",
            }),
            label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text" },
            min: {
                accessor: EAT.WidgetDefinition.Attr("min"),
                prettyName: "Starting Min",
                helpText: "The initial minimum value of the box-plot axis. Note that users can select smaller values by manually dragging the whiskers."
            },
            max: {
                accessor: EAT.WidgetDefinition.Attr("max"),
                prettyName: "Starting Max",
                helpText: "The initial maximum value of the box-plot axis. Note that users can select larger values by manually dragging the whiskers."
            },
            axisLabel: {
                accessor: EAT.WidgetDefinition.Attr("axis-label"),
                prettyName: "Axis Label"
            },
            label_0th: {
                accessor: EAT.WidgetDefinition.Attr("label-0th"),
                prettyName: "0th Percentile",
                category: "Percentile Labels"
            },
            label_25th: {
                accessor: EAT.WidgetDefinition.Attr("label-25th"),
                prettyName: "25th Percentile",
                category: "Percentile Labels"       
            },
            label_50th: {
                accessor: EAT.WidgetDefinition.Attr("label-50th"),
                prettyName: "50th Percentile",
                category: "Percentile Labels"              
            },
            label_75th: {
                accessor: EAT.WidgetDefinition.Attr("label-75th"),
                prettyName: "75th Percentile",
                category: "Percentile Labels"              
            },
            label_100th: {
                accessor: EAT.WidgetDefinition.Attr("label-100th"),
                prettyName: "100th Percentile",
                category: "Percentile Labels"              
            }            
        },
        initWidget: function () {
            this._super();            
            
            if (DEBUG_BOX_AND_WHISKERS) {
                this.get('data').setProperties({
                    _0th: 5,
                    _25th: 15,
                    _50th: 20,
                    _75th: 25,
                    _100th: 45
                });
                this.setProperties({
                    shape: 3,
                    scale: 1.55,
                    location: -1.7
                });
            }
        },
        afterStateResume: function () {
            var percentiles = this.get('data').getProperties(PERCENTILES);
            var boxPlotCompleted = PERCENTILES.every(function (p) {
                return !Ember.isNone(percentiles[p]);
            });
            if (boxPlotCompleted) {
                this.set('doneWithWhiskers', true);
                this.set('doneClicking', true);
            } else {
                // OK, we cheat here.... the state for this widget is fairly complicated to half-resume because
                // of issues with "values that are tentatively set, vs set in stone by clicking"
                // so we refuse to half-resume a box-and-whiskers, and undo the resume
                var data = this.get('data');
                PERCENTILES.forEach(function (p) {
                    data.set(p, undefined);
                });
            }
        },
        serializeData: function (data, errors) {
            var percentiles = this.get('data').getProperties(PERCENTILES);

            if (!this.get('data.percentilesAreDone')) {
                errors.pushObject("You haven't finished specifying the percentiles.");
            }

            var currentQuestion = this.get('currentQuestion');
            if (currentQuestion.length > 0) {
                var modelKey = currentQuestion.attr("key");
                console.log("Setting ", modelKey, " from ", percentiles[modelKey], " to undefined");
                percentiles[modelKey] = undefined;
            }

            data.setProperties(percentiles);
        },
        setCurrentQuestionToMouseX: function (evt) {
            var currentQuestion = this.get('currentQuestion');

            var pixelX = evt.pageX - this.get('boxPlot').offset().left;
            var modelX = this.get("pixelToModelCoords")(pixelX);
            var modelKey = currentQuestion.attr("key");

            if (DEBUG_BOX_AND_WHISKERS) console.log("Setting", modelKey, "to", modelX);

            this.get('data').set(modelKey, modelX);

            this.enforceModelConstraints();
        },
        BoxPlotSubView: Ember.View.extend({
            boxAndWhiskers: undefined, // bound in the template
            classNames: ["box-plot"],
            click: function (evt) {
                this.get('boxAndWhiskers').boxPlotClicked(evt);
            }
        }),
        updateCurrentQuestionText: function () {
            var currentQuestion = this.get('currentQuestion');            
            var labelKey = "label" + currentQuestion.attr("key");
            this.set('currentQuestionText', this.get("definition").get(labelKey)); //currentQuestion.text());
        },
        boxPlotClicked: function (evt) {
            this.setCurrentQuestionToMouseX(evt);
            var currentQuestion = this.get('currentQuestion');
            if (currentQuestion.attr("key") == "_100th") {
                this.set('doneWithWhiskers', true);
            }

            currentQuestion.removeClass("current");
            currentQuestion.addClass("done");
            currentQuestion = currentQuestion.nextAll("li").first();
            if (currentQuestion.length == 0) {
                this.set('doneClicking', true);
            } else {
                currentQuestion.addClass("current");
                this.updateCurrentQuestionText();
            }
            this.redraw();
        },
        hideMouseCursorWhenDoneClicking: function () {
            this.$().find("#mouse-cursor").remove();
        }.observes('doneClicking'),
        currentQuestionText: "Minimum",
        redrawOnDefChange: function () {
            if (this.get('haveSetupDOM')) {
                this.redraw();
            }
        }.observes('definition.min', 'definition.max', 'shape', 'scale', 'location'),
        redraw: function () {
            var boxPlot = this.get('boxPlot');
            var model = this.get('data');
            var definition = this.get('definition');

            // Draw in the axis on the canvas
            var axis = boxPlot.find("canvas#axis");

            // Canvases have a fixed width and height that gets stretched, reset the width
            // and height to match the DOM element's width and height so we have 1:1 pixels
            var canvas = axis.get(0);

            var width = canvas.width = boxPlot.width();
            var height = canvas.height = boxPlot.height();

            axis.width(width).height(height);

            var drawWhiskers = model._0th && model._100th;
            var drawBox = drawWhiskers && model._25th && model._75th;
            var drawMedian = drawBox && model._50th;
            var drawThePDF = this.get('doneClicking');
            var doneWithWhiskers = this.get('doneWithWhiskers');

            var min; var max;
            if (doneWithWhiskers) {
                if (DEBUG_BOX_AND_WHISKERS) console.log("Draw whiskers");
                var range = model._100th - model._0th;
                min = model._0th - (range / 2);
                max = model._100th + (range / 2);
            } else {
                min = definition.get('min');
                max = definition.get('max');
                if (DEBUG_BOX_AND_WHISKERS) console.log("Using min and max", min, max);
            }

            var modelRange = max - min;
            function pixelToModelCoords(pixelX) {
                return ((pixelX / width) * modelRange) + min;
            }
            function modelToPixelCoords(modelX) {
                return ((modelX - min) / modelRange) * width;
            }

            if (drawThePDF) {
                drawDiscretizedPDF(canvas, model, modelToPixelCoords, pixelToModelCoords, this.get('shape'), this.get('scale'), this.get('location'));
            }

            drawAxis(canvas, min, max, modelToPixelCoords);

            this.set("pixelToModelCoords", pixelToModelCoords);
            this.set("modelToPixelCoords", modelToPixelCoords);

            var whiskers = boxPlot.find("#whiskers");
            var box = boxPlot.find("#box");
            var median = boxPlot.find("#median");

            var whiskersBorderWidth = 0; parseInt(whiskers.css('border-right-width'));
            var boxBorderWidth = 0; parseInt(box.css('border-right-width'));

            var whiskersLeft = modelToPixelCoords(model._0th);
            var whiskersWidth = modelToPixelCoords(model._100th) - whiskersLeft - whiskersBorderWidth;
            var boxLeft = modelToPixelCoords(model._25th);
            var boxWidth = modelToPixelCoords(model._75th) - boxLeft - boxBorderWidth;
            var medianLeft = modelToPixelCoords(model._50th);

            if (drawWhiskers) {
                whiskers.css({ left: whiskersLeft, width: whiskersWidth }).fadeIn();
            } else {
                whiskers.fadeOut();
            }

            if (drawBox) {
                box.css({ left: boxLeft, width: boxWidth }).fadeIn();
            } else {
                box.fadeOut();
            }

            if (drawMedian) {
                median.css({ left: medianLeft }).fadeIn();
            } else {
                median.fadeOut();
            }
        },
        onBoxResize: function (evt, ui) {
            var box = this.get('box');
            var whiskers = this.get('whiskers');
            var median = this.get('median');

            var boxLeft = ui.position.left;
            var boxWidth = ui.size ? ui.size.width : box.width();
            var boxRHSLeft = boxLeft + boxWidth;

            var whiskersLeft = parseFloat(whiskers.css('left')) + LINE_WIDTH;
            var whiskersRHSLeft = whiskers.width() + whiskersLeft - 2 * LINE_WIDTH;

            var medianLeft = parseFloat(median.css('left')) - LINE_WIDTH;
            var medianRHSLeft = medianLeft + LINE_WIDTH;

            if (boxLeft < whiskersLeft) {
                box.css({
                    left: whiskersLeft,
                    width: boxWidth + (boxLeft - whiskersLeft)
                });
            }

            if (boxLeft > medianLeft) {
                box.css({
                    left: medianLeft,
                    width: boxWidth + (boxLeft - medianLeft)
                });
            }

            if (boxRHSLeft < medianRHSLeft) {
                box.css({
                    width: medianRHSLeft - boxLeft
                });
            }

            if (boxRHSLeft > whiskersRHSLeft) {
                box.css({
                    width: whiskersRHSLeft - boxLeft
                });
            }
        },
        // Keep Whiskers From Overlapping the Box
        onWhiskersResize: function (evt, ui) {
            var box = this.get('box');
            var whiskers = this.get('whiskers');

            var boxLeft = box.position().left - LINE_WIDTH;
            var boxWidth = box.width();
            var boxRHSLeft = boxLeft + boxWidth + 2 * LINE_WIDTH;

            var whiskersLeft = ui.position.left;
            var whiskersWidth = ui.size.width;
            var whiskersRHSLeft = whiskersLeft + whiskersWidth;

            if (whiskersLeft > boxLeft) {
                whiskers.css({
                    left: boxLeft,
                    width: whiskersWidth + (whiskersLeft - boxLeft)
                });
            }

            if (whiskersRHSLeft < boxRHSLeft) {
                whiskers.css({
                    width: boxRHSLeft - whiskersLeft
                });
            }
        },
        enforceModelConstraints: function () {
            var data = this.get('data');

            var orderedProperties = [ '_0th', '_25th', '_50th', '_75th', '_100th' ];
            var positions = data.getProperties(orderedProperties);

            function setPosition(recipient, donor) {
                positions[recipient] = positions[donor];
                data.set(recipient, positions[donor]);
            }

            function enforceLessThan(lesser, greater, recipient, donor) {
                if (positions[lesser] > positions[greater]) {
                    setPosition(recipient, donor);
                }
            }

            enforceLessThan('_0th', '_25th', '_25th', '_0th');
            enforceLessThan('_25th', '_50th', '_50th', '_25th');
            enforceLessThan('_50th', '_75th', '_50th', '_75th');
            enforceLessThan('_75th', '_100th', '_75th', '_100th');

            // Don't allow _0th to equal _100th
            if (positions['_0th'] >= positions['_100th']) {
                data.set('_100th', data.get('_0th') + 0.01);
            }
        },
        updateModelValuesFromPixelPositions: function () {
            var pixelToModelCoords = this.get("pixelToModelCoords");

            var model = this.get('data');
            var box = this.get('box');
            var whiskers = this.get('whiskers');
            var median = this.get('median');

            var boxLeft = box.position().left;
            var boxRHSLeft = boxLeft + box.width();

            var whiskersLeft = whiskers.position().left;
            var whiskersRHSLeft = whiskers.width() + whiskersLeft;

            var medianLeft = median.position().left;
            var medianRHSLeft = medianLeft;

            model.setProperties({
                _0th: pixelToModelCoords(whiskersLeft),
                _25th: pixelToModelCoords(boxLeft),
                _50th: pixelToModelCoords(medianLeft),
                _75th: pixelToModelCoords(boxRHSLeft),
                _100th: pixelToModelCoords(whiskersRHSLeft)
            });

            this.enforceModelConstraints();

            this.redraw();
        },
        boxPlot: function () {
            return this.$().find(".box-plot");
        }.property(),
        box: function () {
            return this.$().find("#box");
        }.property(),
        whiskers: function () {
            return this.$().find("#whiskers");
        }.property(),
        median: function () {
            return this.$().find("#median");
        }.property(),
        currentQuestion: function () {
            return this.$().find(".current");
        }.property().volatile(),
        setupDebugSliders: function () {
            var widget = this;
            var setupSlider = function (selector, path, min, max) {
                var slider = widget.$().find(selector);
                var locChanged = function () {
                    var val = parseFloat(slider.slider("value"));
                    widget.set(path, val);
                }
                slider.slider({
                    change: locChanged,
                    slide: locChanged,
                    min: min,
                    max: max,
                    step: 0.01,
                    value: widget.get(path)
                });
            }

            setupSlider("#location-slider", 'location', -3, 3);
            setupSlider("#scale-slider", 'scale', 0, 3);
            setupSlider("#shape-slider", 'shape', 0, 10);
        },
        setupDOM: function () {
            this.updateCurrentQuestionText();
                        
            var boxPlot = this.get('boxPlot');

            // Need to initialze exCanvas, c.f. "IE Sux"
            if (G_vmlCanvasManager != undefined) {
                var canvasElement = this.$().find("canvas")[0];
                canvasElement = ElicitationUtils.recreateCanvasElement(canvasElement);
                G_vmlCanvasManager.initElement(canvasElement);
            }

            this.set('haveSetupDOM', true);

            this.setupDebugSliders();

            var boxAndWhiskers = this;
            function b(f) {
                return function () {
                    f.apply(boxAndWhiskers, arguments);
                }
            }

            var box = boxPlot.find("#box");

            var whiskers = boxPlot.find("#whiskers").resizable({ handles: "w,e", containment: "parent", resize: b(this.onWhiskersResize), stop: b(this.updateModelValuesFromPixelPositions) });
            boxPlot.find("#median").draggable({ axis: "x", containment: box, stop: b(this.updateModelValuesFromPixelPositions) });

            var self = this;
            var mouseCursor = this.$().find("#mouse-cursor");
            boxPlot.mouseenter(function (evt) {
                mouseCursor.show();
            }).mousemove(function (evt) {
                if (!self.get('doneClicking')) {
                    var pixelX = evt.pageX - boxPlot.offset().left;
                    var modelX = boxAndWhiskers.get("pixelToModelCoords")(pixelX);

                    mouseCursor.css('left', pixelX);
                    self.setCurrentQuestionToMouseX(evt);
                    self.redraw();
                }
            }).mouseleave(function (evt) {
                mouseCursor.hide();
            });

            box.resizable({
                handles: "w,e",
                resize: b(this.onBoxResize),
                stop: b(this.updateModelValuesFromPixelPositions)
            });

            var boxDragStartMedianLeft;
            box.draggable({
                axis: "x",
                containment: whiskers,
                start: b(function (evt, ui) {
                    boxDragStartMedianLeft = this.get('median').position().left;
                }),
                drag: b(function (evt, ui) {
                    this.get('median').css("left", boxDragStartMedianLeft - (ui.originalPosition.left - ui.position.left));
                }),
                stop: b(this.updateModelValuesFromPixelPositions)
            });

            if (DEBUG_BOX_AND_WHISKERS) {
                this.$().find(".DEBUG").show();
                this.$().find("#mouse-cursor").remove();
                this.$().find("#axis-label").hide();
                this.$().find("#instructions").hide();
            }

            this.redraw();
        }
    });


    function drawArrowhead(ctx) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-12, -6);
        ctx.lineTo(-12, 6);
        ctx.closePath();
        ctx.fill();
    }

    function log10(val) {
        return Math.log(val) / Math.log(10);
    }

    function drawDiscretizedPDF(canvas, rawPercentiles, modelToPixelCoords, pixelToModelCoords) {
        var PDF_COLOR = "rgb(150,150,255)";
        var PDF_LINE_WIDTH = 2;
        var HORIZONTAL_OFFSET = 2; // FIXME: should this be here?
        var VERTICAL_OFFSET = 60;
        var PIXEL_STEP_X = 1;

        var height = canvas.height;
        var width = canvas.width;

        var pdfHeight = height - VERTICAL_OFFSET - 50;

        var ctx = canvas.getContext("2d");

        ctx.save(); {
            ctx.translate(HORIZONTAL_OFFSET, VERTICAL_OFFSET);
            ctx.strokeStyle = PDF_COLOR;
            ctx.lineCap = 'round';

            var percentiles = [
                { percentile: 0, x: modelToPixelCoords(rawPercentiles._0th) },
                { percentile: 25, x: modelToPixelCoords(rawPercentiles._25th) },
                { percentile: 50, x: modelToPixelCoords(rawPercentiles._50th) },
                { percentile: 75, x: modelToPixelCoords(rawPercentiles._75th) },
                { percentile: 100, x: modelToPixelCoords(rawPercentiles._100th) },
            ];

            var bars = [];

            var numPercentiles = 5; // We were using precentiles.length, but for some weird reason, this was evaluating to 6 on IE8, oops

            for (var i = 1; i < numPercentiles; i++) {
                var percentile = percentiles[i];
                var lastPercentile = percentiles[i - 1];

                var width = percentile.x - lastPercentile.x;
                var area = percentile.percentile - lastPercentile.percentile;

                bars.push({
                    x1: lastPercentile.x,
                    x2: percentile.x,
                    y: area / width
                });
            }

            var yFactor = 100;

            // Draw the PDF
            ctx.lineWidth = PDF_LINE_WIDTH;
            ctx.fillStyle = "rgba(0,0,255,0.1)";

            for (var i = 0; i < bars.length; i++) {
                var bar = bars[i];

                bar.y *= yFactor;

                ctx.beginPath();
                ctx.moveTo(bar.x1, 0);
                ctx.lineTo(bar.x1, bar.y);
                ctx.lineTo(bar.x2, bar.y);
                ctx.lineTo(bar.x2, 0);
                ctx.stroke();
                ctx.closePath();
                ctx.fill();
            }

        } ctx.restore();
    }


    function drawPDF(canvas, percentiles, modelToPixelCoords, pixelToModelCoords, shape, scale, location) {
        var skew = shape;
        var PDF_COLOR = "rgb(200,200,255)";
        var PDF_LINE_WIDTH = 2;
        var HORIZONTAL_OFFSET = 2; // FIXME: should this be here?
        var VERTICAL_OFFSET = 60;
        var PIXEL_STEP_X = 1;

        var height = canvas.height;
        var width = canvas.width;

        var pdfHeight = height - VERTICAL_OFFSET - 50;

        var ctx = canvas.getContext("2d");

        var modelMin = percentiles._0th;
        var modelMax = percentiles._100th;
        var modelTweak = (modelMax - modelMin) * 0.05;
        modelMin -= modelTweak;
        modelMax += modelTweak;

        // http://www.sciencedirect.com/science/article/pii/S209012321000069X
        //var skew = 0.8;
        var skew_2 = Math.pow(skew, 2.0);
        var skew_3 = Math.pow(skew, 3.0);
        var sqrtOf2PI = Math.sqrt(2 * Math.PI);
        var approximateSkewNormalPDF = function (sigma) {
            var x = sigma;
            var x_2 = Math.pow(x, 2.0);
            var x_3 = Math.pow(x, 3.0);
            var ePart = Math.pow(Math.E, -x_2 / 2);

            if (x < (-3 / skew)) {
                return 0;
            } else if (x < (-1 / skew)) {
                var a = 9 * skew * x + 3 * skew_2 * x_2 + (1 / 3) * skew_3 * x_3 + 9;
                return (1 / (8 * sqrtOf2PI)) * ePart * a;
            } else if (x < (1 / skew)) {
                var a = 3 * skew * x - (1 / 3) * skew_3 * x_3 + 4;
                return (1 / (4 * sqrtOf2PI)) * ePart * a;
            } else if (x < (3 / skew)) {
                var a = 9 * skew * x - 3 * skew_2 * x_2 + (1 / 3) * skew_3 * x_3 + 7;
                return (1 / (8 * sqrtOf2PI)) * ePart * a;
            } else {
                return Math.sqrt(2 / Math.PI) * ePart;
            }
        }

        var sigmaBound = 2.698;
        var getPixelYForPixelX = function (pixelX) {
            var modelX = pixelToModelCoords(pixelX);
            var modelPercent = (modelX - modelMin) / (modelMax - modelMin);
            var sigma = (modelPercent - 0.5) * (sigmaBound * 2);
            sigma = (sigma - location) / scale;
            return approximateSkewNormalPDF(sigma);

            // if (modelPercent > 1.0 || modelPercent < 0.0) return 0.0;
            //return Math.sin(modelPercent * Math.PI);
        }

        var fillQuantile = function (fromModelX, toModelX, segments, fillColor) {
            var fromPixelX = modelToPixelCoords(fromModelX);
            var toPixelX = modelToPixelCoords(toModelX);

            ctx.save(); {
                ctx.fillStyle = fillColor;
                ctx.strokeStyle = fillColor;
                ctx.beginPath();

                for (var i = 0; i < segments.length; i++) {
                    var segment = segments[i];
                    if (segment.x >= fromPixelX) {
                        // Start our path
                        ctx.moveTo(segment.x, 0);
                    }

                    if (segment.x >= fromPixelX && segment.x < toPixelX) {
                        ctx.lineTo(segment.x, segment.y);
                    }

                    if (segment.x >= toPixelX) {
                        // End our path
                        ctx.moveTo(segment.x, 0);
                    }
                }

                ctx.stroke();
            } ctx.restore();
        }

        var fillSegmentQuantile = function (areaRatio, segments, fillColor) {
            if (areaRatio >= 1.0 || areaRatio <= 0.0) throw "Bad areaRatio";

            var totalArea = 0;
            for (var i = 0; i < segments.length; i++) {
                totalArea += segments[i].y;
            }

            var targetArea = areaRatio * totalArea;
            var area = 0;
            var segment = undefined;
            for (var i = 0; i < segments.length && area < targetArea; i++) {
                var segment = segments[i];
                area += segment.y;
            }

            ctx.save(); {
                ctx.strokeStyle = fillColor;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(segment.x, 0);
                ctx.lineTo(segment.x, segment.y);
                ctx.stroke();

                ctx.stroke();
            } ctx.restore();

            return segment.x;
        }

        ctx.save(); {
            ctx.translate(HORIZONTAL_OFFSET, VERTICAL_OFFSET);
            ctx.strokeStyle = PDF_COLOR;
            ctx.lineCap = 'round';

            var segments = [];
            var maxY = 0;
            for (var pixelX = 0; pixelX < width; pixelX++) {
                var pixelY = getPixelYForPixelX(pixelX);
                segments.push({
                    x: pixelX,
                    y: pixelY
                });
                if (pixelY > maxY) maxY = pixelY;
            }


            /*
            var lastY = 0;
            var currentArea = 0.0;
            var totalArea = 1;
            for (var i=0; i < percentiles.length; i++) {
                var percentile = percentiles[i];
                var AreaOfSection = percentile - currentArea;
                currentArea = percentile;
                var width = percentile - 
                var y = (2 * AreaOfSection / // y = (2A_of_Section / width) - prevY
            }*/

            var yFactor = pdfHeight / maxY;

            yFactor = 300;

            // Draw the Axis
            ctx.lineWidth = PDF_LINE_WIDTH;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (var i = 0; i < segments.length; i++) {
                var y = segments[i].y *= yFactor;
                if (y <= 0) {
                    ctx.moveTo(Math.round(segments[i].x), Math.round(y));
                } else {
                    ctx.lineTo(Math.round(segments[i].x), Math.round(y));
                }
            }
            ctx.stroke();
            ctx.closePath();

            if (!DEBUG_BOX_AND_WHISKERS) {
                // Fill the quantiles
                fillQuantile(percentiles._0th, percentiles._25th, segments, "rgba(0,0,255,0.1)");
                fillQuantile(percentiles._75th, percentiles._100th, segments, "rgba(0,0,255,0.1)");

                fillQuantile(percentiles._25th, percentiles._50th, segments, "rgba(0,0,255,0.2)");
                fillQuantile(percentiles._50th, percentiles._75th, segments, "rgba(0,0,255,0.2)");
            } else {
                var median = fillSegmentQuantile(0.5, segments, "rgba(255,0,0,1.0)");
                var first = fillSegmentQuantile(0.25, segments, "rgba(0,255,0,1.0)");
                var third = fillSegmentQuantile(0.75, segments, "rgba(0,255,0,1.0)");
                var zeroth = fillSegmentQuantile(0.007, segments, "rgba(255,0,0,1.0)");
                var fourth = fillSegmentQuantile(.993, segments, "rgba(255,0,0,1.0)");
                if (DEBUG_BOX_AND_WHISKERS) console.log("LHS:", (first - zeroth) / (median - first));
                if (DEBUG_BOX_AND_WHISKERS) console.log("RHS:", (fourth - third) / (third - median));
            }

        } ctx.restore();
    }

    function drawAxis(canvas, min, max, modelToPixelCoords) {
        var AXIS_COLOR = "rgb(60,60,60)";
        var TICK_LENGTH = 15;
        var HORIZONTAL_OFFSET = 2; // FIXME: should this be here?
        var VERTICAL_OFFSET = 60;

        var height = canvas.height;
        var width = canvas.width;

        var ctx = canvas.getContext("2d");

        ctx.save(); {

            // Position the Axis

            ctx.translate(HORIZONTAL_OFFSET, VERTICAL_OFFSET);
            ctx.strokeStyle = AXIS_COLOR;
            ctx.lineCap = 'round';

            // Draw the Axis
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(width, 0);
            ctx.stroke();

            // Draw the Arrows At the End of the Axis
            ctx.fillStyle = AXIS_COLOR;
            ctx.save(); {
                ctx.rotate(Math.PI);
                drawArrowhead(ctx);
            } ctx.restore();
            ctx.save(); {
                ctx.translate(width, 0);
                drawArrowhead(ctx);
            } ctx.restore();


            // Draw the tick marks
            ctx.lineWidth = 2;
            ctx.save(); {
                ctx.translate(0, -TICK_LENGTH / 2);
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

                if (range / tickSize > maxNumMajorTicks) {
                    majorTickEvery *= 2;
                }

                var majorTickSize = tickSize * majorTickEvery;
                var start = Math.round(min / majorTickSize) * majorTickSize;

                if (DEBUG_BOX_AND_WHISKERS) console.log("Drawing axis: range is", range, "scale is", scale, "tickSize is", tickSize, "majorTickEvery is", majorTickEvery, "start is", start);

                var numTicksSinceMajor = 0;
                for (var modelX = start; modelX < max; modelX += tickSize) {
                    var pixelX = modelToPixelCoords(modelX);

                    var majorTick = numTicksSinceMajor >= majorTickEvery;
                    if (majorTick) numTicksSinceMajor = 0;
                    numTicksSinceMajor++;

                    // Don't draw ticks too close to the arrowheads
                    if (pixelX < 15 || pixelX > width - 15) continue;

                    ctx.save(); {
                        var lengthOffset = 0;
                        if (majorTick) {
                            ctx.lineWidth = 2;
                        } else {
                            lengthOffset = 1;
                            ctx.lineWidth = 1;
                        }

                        ctx.translate(Math.round(pixelX), Math.round(lengthOffset));

                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.lineTo(0, Math.round(TICK_LENGTH - 2 * lengthOffset));
                        ctx.stroke();

                        if (majorTick) {
                            var tickLabel;
                            if (scale < 1) {
                                tickLabel = modelX.toFixed(Math.abs(scale));
                            } else {
                                tickLabel = modelX.toFixed();
                            }
                            ctx.fillText(tickLabel, 0, TICK_LENGTH + 5);
                        }
                    } ctx.restore();
                }
            } ctx.restore();
        } ctx.restore();
    }

})(EAT, Ember, window.G_vmlCanvasManager);