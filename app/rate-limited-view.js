(function (EAT, window, undefined) {
    "use strict";

    var DEBUG_MASQUERADE_AS_IE8 = false;
    var OLD_IE_DEADLINE = 5000; // ms

    function isIE7or8() {
        if (DEBUG_MASQUERADE_AS_IE8) {
            console.log("WARNING DEBUG CODE IS ON: DEBUG_MASQUERADE_AS_IE8=true in rate-limited-view.js, forcibly enabling rate limited views!");
            return true;
        }

        var ieVersion = getInternetExplorerVersion();
        return ieVersion == 8 || ieVersion == 7;
    }

    // Returns the version of Internet Explorer or a -1
    // (indicating the use of another browser).
    function getInternetExplorerVersion() {
        var rv = -1; // Return value assumes failure.
        if (navigator.appName == 'Microsoft Internet Explorer') {
            var ua = navigator.userAgent;
            var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null)
                rv = parseFloat(RegExp.$1);
        }
        return rv;
    }

    // FIXME: not sure we'll need context, but leaving it in for now
    var CONTEXT = null;
    var toShowQueue = [];

    function showChunkOfViews() {
        console.log("showChunkOfViews, n=", toShowQueue.length);

        var endAtTime = Date.now() + OLD_IE_DEADLINE;

        while (toShowQueue.length > 0 &&
               Date.now() < endAtTime) {
            var toShow = toShowQueue.pop();
            Ember.run(function () {
                toShow.showRateLimitedView();
            });
            //console.log("\titem shown: ", endAtTime - Date.now(), "ms remain");
        }

        console.log("\tdone: ", endAtTime - Date.now(), "ms remain");

        if (toShowQueue.length > 0) {
            console.log("\ttime's up! rescheduling");
            Ember.run.scheduleOnce("render", CONTEXT, showChunkOfViews);
        }
        console.log("\ttoShowQueue.length=", toShowQueue.length);
    }

    // Ways to make RateLimitedViews not render...
    /*
    
    1: Require a child-view wrapper in all cases
    PRO: didInsertElement won't be called until its actually ready
    CON: requires an extra wrapper widget for each element.... on all platforms

    2: Set layout to a blank layout, later unset the layout (or replace with an existing layoutName?), and rerender
    PRO: quick-hack to allow rows and stuff to be rate limited
    CON: didInsertElement will be called, could have complex + undesirable interactiosn with existing layout

    */
    var blankTemplate = Ember.Handlebars.compile('');

    var RateLimitedViewMixin = Ember.Mixin.create({
        _shouldBeVisible: false,
        init: function () {
            this._super();
            toShowQueue.push(this);
            Ember.run.scheduleOnce("render", CONTEXT, showChunkOfViews);
        },
        template: function () {
            console.log('template:');
            if (this.get('_shouldBeVisible')) {
                console.log("\tReturning the real template!");
                return this._super();
                this.rerender();
            } else {
                console.log("\tBlank template");
                return blankTemplate;
            }
        }.property('_shouldBeVisible'),
        render: function (buffer) {
            console.log("Render called...");
            this._super(buffer);
        },
        showRateLimitedView: function () {
            console.log("showRateLimitedView()");
            this.set('_shouldBeVisible', true);
            //this.set('layoutName', 'rate-limited-view-is-not-blank');

            /*
            FIXME: rerender is resulting in TWO copies of the shit in question. UGH!
            Maybe nest as a child view (UGH, how to avoid interfering with NON ie8 case?)
            Or maybe just make this a special case thing, use it in the table related views,
            trust that is enough (is it?) and move on with our lives.... still what about slower
            views like, say, having 5 time-trends on the page???
            */
        },
        fetchMe: function () {
            console.log("RateLimitedView.fetchMe()")
            if (!this.get('_shouldBeVisible')) {
                throw "Fetch me should not be accessed until it _shouldBeVisible!";
                console.log("Fetch me should not be accessed until it _shouldBeVisible!");
            } else {
                console.log("\tok: should be visible");
                return "*";
            }   
        }.property()
    });

    if (isIE7or8()) {
        console.log("Loading rate-limited-view.js");
        EAT.RateLimitedViewMixin = RateLimitedViewMixin;
    } else {
        console.log("Not on IE7/8, just using straight-up Ember.View");
        EAT.RateLimitedViewMixin = Ember.Mixin.create({});
    }

})(EAT, window);