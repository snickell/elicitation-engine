


// DEPRECATED
/*
var RowModel = EAT.WidgetDefinition.extend({
    color: '#ffaaaa',
    label: 'untitled',
    style: function () {
        return "background-color: " + this.get('color');
    }.property('color'),
    allColValues: function () {
        return this.get('cols.@each.value');
    }.property('cols.@each.value'),
    allocation: function () {
        var total = 0;
        this.get('cols').each(function (col) {
            total += col.get('allocation');
        });
        return total;
    }
});

var ColModel = EAT.WidgetDefinition.extend({
    label: 'untitled',
    value: undefined,
    style: function () {
        return "background-color: " + this.get('color');
    }.property('color')
});

var AreaAllocationModel = EAT.WidgetDefinition.extend({
    height: 200,
    totalAllocation: 100,
    totalAllocated: function () {
        var total = 0;
        this.get('rows').each(function (row) {
            total += row.get('allocation');
        });
        return total;
    }
});

EAT.Widget.register('area-allocation', {
    prettyName: "Area Allocation",
    templateName: 'area-allocation',
    height: 200,
    definitionSchema: {
        model: AreaAllocationModel,
        label: { accessor: EAT.WidgetDefinition.ChildNode('label'), type: "Text" },
        totalAllocation: { accessor: EAT.WidgetDefinition.Attr('total-allocation'), prettyName: "Allocation", type: "MillionsOfDollars" },
        height: { accessor: EAT.WidgetDefinition.Attr('height'), helpText: "Number representing the height of the area allocation chart in pixels. For example, to make a 200 pixels-high chart, enter 200" },
        rows: {
            type: "HasMany",
            prettyName: 'Row',
            emphasizeWhenEmpty: true,
            accessor: EAT.WidgetDefinition.HasMany('row', {
                model: RowModel,
                color: { accessor: EAT.WidgetDefinition.Attr('color'), type: "Color" },
                label: { accessor: EAT.WidgetDefinition.ChildNode('label'), helpText: "While the label isn't shown yet, its important to set a label on the row, as the label is used for recording data" },
                cols: {
                    type: "HasMany",
                    prettyName: 'Col',
                    emphasizeWhenEmpty: true,
                    accessor: EAT.WidgetDefinition.HasMany('column', {
                        model: ColModel,
                        label: { accessor: EAT.WidgetDefinition.Contents() },
                        allocation: { accessor: EAT.WidgetDefinition.Attr('allocation'), helpText: "Allocation is a number (with no % sign) representing the percentage of the total area chart this column will initially fill. Values must sum to 100% or chart behavior is currently undefined. If you want all columns equally sized, divide 100 by the number of columns and set every value to this number." }
                    })
                }
            })
        }
    },
    //row
    setupDOM: function () {
        alert("WARNING: the area allocation widget is deprecated, and will soon be removed. If the allocation table widget is NOT a suitable replacement, please contact snickell@gmail.com ASAP.");
    },
    serializeData: function (data, errors) {
    }
});
*/
