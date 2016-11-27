/*
(function (Elicitation, Ember) {
    "use strict;"

    var RowModel = Elicitation.WidgetDefinition.extend({
        color: '#ffaaaa',
        label: 'untitled',
        style: function () {
            return "background-color: " + this.get('color');
        }.property('color'),
        allColValues: function () {
            return this.get('cols.@each.value');
        }.property('cols.@each.value')
    });

    var ColModel = Elicitation.WidgetDefinition.extend({
        label: 'untitled',
        value: undefined,
        style: function () {
            return "background-color: " + this.get('color');
        }.property('color')
    });

    // FIXME: DISABLE AREA ALLOCATION WIDGET
    return;

    Elicitation.Widget.register('area-allocation', {
        prettyName: "Area Allocation",
        templateName: 'area-allocation',
        height: 200,
        definitionSchema: {
            model: Elicitation.WidgetDefinition.extend({
                height: 200
            }),
            label: { accessor: Elicitation.WidgetDefinition.ChildNode('label'), type: "Text" },
            totalBudgetInMillions: { accessor: Elicitation.WidgetDefinition.Attr('total-budget-in-millions'), prettyName: "Allocation", type: "MillionsOfDollars" },
            height: { accessor: Elicitation.WidgetDefinition.Attr('height'), helpText: "Number representing the height of the area allocation chart in pixels. For example, to make a 200 pixels-high chart, enter 200" },
            rows: {
                type: "HasMany",
                prettyName: 'Row',
                emphasizeWhenEmpty: true,
                accessor: Elicitation.WidgetDefinition.HasMany('row', {
                    model: RowModel,
                    color: { accessor: Elicitation.WidgetDefinition.Attr('color'), type: "Color" },
                    label: { accessor: Elicitation.WidgetDefinition.ChildNode('label'), helpText: "While the label isn't shown yet, its important to set a label on the row, as the label is used for recording data" },
                    cols: {
                        type: "HasMany",
                        prettyName: 'Col',
                        emphasizeWhenEmpty: true,
                        accessor: Elicitation.WidgetDefinition.HasMany('column', {
                            model: ColModel,
                            label: { accessor: Elicitation.WidgetDefinition.Contents() },
                            value: { accessor: Elicitation.WidgetDefinition.Attr('value'), helpText: "Value is a number (with no % sign) representing the percentage of the total area chart this column will initially fill. Values must sum to 100% or chart behavior is currently undefined. If you want all columns equally sized, divide 100 by the number of columns and set every value to this number." }
                        })
                    }
                })
            }
        },
        // BAD HACK TO HELP AREA CHART THROUGH ROUGH TIMES
        // THAT SAID:
        // we really should redraw every widget when we switch it on/off visibility 
        // (which editMode does since it shows all)
        fixmeRerenderOnEditModeChange: function () {
            this.rerender();
        }.observes('Elicitation.editMode'),
        getDOM: function () {
            var dom = this.$();
            if (Ember.isNone(dom)) return undefined;
            return dom.find(".widget.area");
        },
        heightChanged: function () {
            var height = this.get('definition.height');
            var widget = this.getDOM();
            if (Ember.isNone(widget)) return;

            widget.css("height", height);
        }.observes('definition.height'),
        doARerender: function () {
            this.rerender();
        }.observes('definition.rows.@each.allColValues', 'definition.totalBudgetInMillions'),
        setupDOM: function () {
            var widget = this.getDOM();

            this.get('definition').notifyPropertyChange('height');
            var elicitationWidget = this;
            window.lastDOM = widget;
            var rows = widget.find(".row");

            rows.each(function () {
                var cols = $(this).find(".col");

                var opacity = 0.0;
                var opacityIncrease = (1.0 / (cols.length + 1.0));
                cols.each(function () {
                    $(this).css('background-color', 'rgba(255,255,255,' + opacity + ')');
                    opacity += opacityIncrease;
                });
                $(this).find(".coldragger").last().remove();
            });
            widget.find(".rowdragger").last().remove();

            widget.find(".coldragger").each(function () {
                var prevCol = $(this).prevAll(".col").first();
                var nextCol = $(this).nextAll(".col").first();

                // We can't directly initialize these, because they are not displayed by
                // default and therefore have width = 0
                var prevColLabelWidth = null;
                var nextColLabelWidth = null;

                $(this).drag("start", function (ev, dd) {
                    dd.prevColWidth = prevCol.width();
                    dd.nextColWidth = nextCol.width();

                    if (!prevColLabelWidth) prevColLabelWidth = prevCol.find("#measurer").width();
                    if (!nextColLabelWidth) nextColLabelWidth = nextCol.find("#measurer").width();
                }).drag(function (ev, dd) {
                    var prevColWidth = dd.prevColWidth + dd.deltaX;
                    var nextColWidth = dd.nextColWidth - dd.deltaX;

                    if (prevColWidth < 0) {
                        nextColWidth += prevColWidth;
                        prevColWidth = 0;
                    }

                    if (nextColWidth < 0) {
                        prevColWidth += nextColWidth;
                        nextColWidth = 0;
                    }

                    prevCol.css('width', prevColWidth);
                    nextCol.css('width', nextColWidth);

                    //console.log("prevColWidth", prevColWidth, "prevColLabelWidth", prevColLabelWidth);
                    if (prevColWidth < prevColLabelWidth + 10) {
                        prevCol.addClass("small");
                    } else {
                        prevCol.removeClass("small");
                    }

                    if (nextColWidth < nextColLabelWidth + 10) {
                        nextCol.addClass("small");
                    } else {
                        nextCol.removeClass("small");
                    }

                    elicitationWidget.redraw();
                });
            });


            widget.find(".rowdragger").each(function () {
                var prevRow = $(this).prev(".row");
                var nextRow = $(this).next(".row");
                $(this).drag("start", function (ev, dd) {
                    dd.prevRowHeight = prevRow.height();
                    dd.nextRowHeight = nextRow.height();
                }).drag(function (ev, dd) {
                    var prevRowHeight = dd.prevRowHeight + dd.deltaY;
                    var nextRowHeight = dd.nextRowHeight - dd.deltaY;

                    if (prevRowHeight < 0) {
                        nextRowHeight += prevRowHeight;
                        prevRowHeight = 0;
                    }

                    if (nextRowHeight < 0) {
                        prevRowHeight += nextRowHeight;
                        nextRowHeight = 0;
                    }

                    prevRow.css('height', prevRowHeight);
                    nextRow.css('height', nextRowHeight);
                    redrawAreaWidget(widget);
                });
            });

            var totalHeight = widget.height() - widget.find(".rowdragger").length * widget.find(".rowdragger").height();
            var rows = widget.find(".row");
            rows.each(function () {
                var totalWidth = $(this).find(".colbox").width() - $(this).find(".coldragger").length * ($(this).find(".coldragger").first().width() + 2);

                var totalPercentageForRow = 0;
                var cols = $(this).find(".col");
                cols.each(function () {
                    var percent = parseFloat($(this).attr('value'));
                    totalPercentageForRow += percent;
                });
                console.log("totalPercentageForRow", totalPercentageForRow, "totalWidth", totalWidth);

                var cumulativeWidth = 0;
                cols.each(function () {
                    var percent = parseFloat($(this).attr('value'));
                    var width = Math.floor((percent / totalPercentageForRow) * totalWidth);
                    $(this).css('width', width);
                    cumulativeWidth += width;
                });

                var lastCol = $(this).find(".col").first();
                lastCol.css('width', lastCol.width() + totalWidth - cumulativeWidth);

                var rowHeight = Math.floor((totalPercentageForRow / 100.0) * totalHeight);
                $(this).css('height', rowHeight);

            });

            var giveInstructions = function () {
                alert("To input your allocation, use your mouse to drag the sliders located between the rows and columns.\n\nWe suggest you try to allocate the rows first.");
                window.setTimeout(function () {
                    pulseAreaWidgetSliders(widget);
                }, 500);
            }

            widget.find("#percent").click(giveInstructions);

            this.redraw();
        },
        redraw: function () {
            var widget = this.$();
            var totalBudgetInMillions = this.get("definition.totalBudgetInMillions");
            var usePercent = !totalBudgetInMillions;

            var totalArea = 0;
            widget.find(".row").each(function () {
                $(this).find(".col").each(function () {
                    totalArea += $(this).width() * $(this).height();
                });
            });

            widget.find(".row").each(function () {
                var rowTotalPercent = 0;
                $(this).find(".col").each(function () {
                    var percentDiv = $(this).find("#percent");
                    var area = $(this).width() * $(this).height();

                    var percent = area / totalArea * 100;

                    rowTotalPercent += percent;

                    if (usePercent) {
                        if (percent > 5.0) {
                            percent = Math.round(percent);
                        } else {
                            percent = Math.round(percent * 10.0) / 10.0;
                        }
                        percentDiv.html("" + percent + "%");
                    } else {
                        percentDiv.html("$" + (totalBudgetInMillions * (percent / 100.0)).toPrecision(2) + "M");
                    }
                });
                $(this).children("#label-holder").find("#percent").html("" + Math.round(rowTotalPercent) + "%");
            });
        },
        serializeData: function (data, errors) {
            var widget = this.$();
            var totalArea = 0;
            widget.find(".row").each(function () {
                $(this).find(".col").each(function () {
                    totalArea += $(this).width() * $(this).height();
                });
            });

            widget.find(".row").each(function () {
                window.debugRow = $(this);
                var rowName = $(this).attr('dataKey');
                $(this).find(".col").each(function () {
                    var colName = $(this).attr('dataKey');
                    var percentDiv = $(this).find("#percent");
                    var area = $(this).width() * $(this).height();

                    var percent = (area / totalArea * 100).toFixed(1);
                    data.set(rowName + "_" + colName, percent + "%");
                });
            });
        }
    });
*/
    /*
    
    
    function pulseAreaWidgetSliders(widget) {
        var pulseSlider = function (sliders, callback) {
            var oldBGColor = sliders.css('background-color');
    
            var slidersToRed = 0;
            sliders.animate({ backgroundColor: 'red' }, function () {
                slidersToRed++;
                if (slidersToRed == sliders.length) {
                    var slidersBackToOld = 0;
                    sliders.animate({ backgroundColor: oldBGColor }, function () {
                        slidersBackToOld++;
                        if (slidersBackToOld == sliders.length) {
                            callback();
                        }
                    });
                }
            });
        }
    
        pulseSlider(widget.find(".rowdragger"), function () {
            pulseSlider(widget.find(".coldragger"), function () {
                // nothing to do...
            });
        });
    }
    
    function areaWidgetAfterEnter(widget) {
        redrawAreaWidget(widget);
        window.setTimeout(function () {
            pulseAreaWidgetSliders(widget);
        }, 1000);
    }
    
    
    widgets.push({
        name: 'area',
        initialize: initializeAreaWidget,
        exit: storeDataForAreaWidget,
        afterEnter: areaWidgetAfterEnter,
    });
    
    function storeDataForAreaWidget(widget, data) {
        var totalArea = 0;
        widget.find(".row").each(function () {
            $(this).find(".col").each(function () {
                totalArea += $(this).width() * $(this).height();
            });
        });
    
        var widgetName = widget.attr('name');
    
        widget.find(".row").each(function () {
            var rowName = $(this).attr('name');
            $(this).find(".col").each(function () {
                var colName = $(this).attr('name');
                var percentDiv = $(this).find("#percent");
                var area = $(this).width() * $(this).height();
    
                var percent = (area / totalArea * 100).toFixed(1);
                data[widgetName + "_" + rowName + "_" + colName] = percent + "%";
            });
        });
    
        // No errors
        return [];
    }
    */
})(EAT, Ember);