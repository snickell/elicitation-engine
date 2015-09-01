// Sometimes feature detection just doesn't make sense when its an old-IE bug you're trying to work around
// from jquery pre-1.9

/*!
 * Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors; Licensed MIT
 */
(function(window, undefined ) {
    "use strict";

    var uaMatch = function (ua) {
        ua = ua.toLowerCase();

        var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
		    /(webkit)[ \/]([\w.]+)/.exec(ua) ||
		    /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
		    /(msie) ([\w.]+)/.exec(ua) ||
		    ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
		    [];

        return {
            browser: match[1] || "",
            version: match[2] || "0"
        };
    };

    var matched = uaMatch(navigator.userAgent);
    var browser = {};

    if (matched.browser) {
        browser[matched.browser] = true;
        browser.version = matched.version;
    }

    // Chrome is Webkit, but Webkit is also Safari.
    if (browser.chrome) {
        browser.webkit = true;
    } else if (browser.webkit) {
        browser.safari = true;
    }

    window.BrowserDetection = browser;
})(window);
