/*
    Attribute Data To You (public/panel-only/no): specific input you make on this page may be attributed to you
    Mention Your Participation: (public/panel-only/no) your participation
    Anonymous Data: (public/panel-only/no) your input will be shared as part of a statistical aggregate of everyone's input

    The Public: your participation, anonymized data
    Other Panelists: attributed data

    Your Participation          : public
    Your Responses (Anonymous)  : public
    Your Responses (Attributed) : confidential


    Who will know that I participated? The public / everyone
    Who can see my responses? 


*/

require('./styles/nearzero-confidentiality-indicator.css');

var DEBUG = true;
var DEBUG_boxEl = null;

var examplePolicy = {
    label: "Public",
};

var currentConfidentialityPolicy = JSON.parse(sessionStorage.getItem('currentConfidentialityPolicy'));
if (currentConfidentialityPolicy === null) currentConfidentialityPolicy = {};

var indicatorEl = null;
var policyIndicatorKeyToEl = {};



function addUniqueKeys(obj, keys) {
    for (var keyName in obj) {
        if ($.inArray(keyName, keys) === -1) {
            keys.push(keyName);
        }
    }
}

function getPolicyChanges(oldPolicy, newPolicy) {
    var keys = [];
    addUniqueKeys(oldPolicy, keys);
    addUniqueKeys(newPolicy, keys);

    var policyChanges = [];
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];

        if (oldPolicy[key] !== newPolicy[key]) {
            policyChanges.push({
                key: key,
                oldVal: oldPolicy[key],
                newVal: newPolicy[key]
            });
        }
    }

    return policyChanges;
}

function foreachPolicyIn(policy, cb) {
    for (var policyName in policy) {
        cb(policyName, policy[policyName]);
    }
}

function animateLeft($src, $tgt) {
    var $parent = $src.parent();
    var width = $parent.width();
    var srcWidth = $src.width();

    $src.css({ position: 'absolute' });
    $tgt.hide().appendTo($parent).css({ left: width, position: 'absolute' });

    $src.animate({ left: -width }, 500, function () {
        $src.hide();
        $src.css({ left: null, position: null });
    });
    $tgt.show().animate({ left: 0 }, 500, function () {
        $tgt.css({ left: null, position: null });
    });
}

function animatePolicyChanges(policyChanges) {
    for (var i = 0; i < policyChanges.length; i++) {
        var policyChange = policyChanges[i];
        console.log("\t" + policyChange.key + " is now " + policyChange.newVal + " (was " + policyChange.oldVal + ")");

        if (policyChange.newVal == undefined) {
            var policyEl = policyIndicatorKeyToEl[policyChange.key];
            delete policyIndicatorKeyToEl[policyChange.key];

            policyEl.addClass("deleted").delay(600).slideUp();//.remove();
        } else if (policyChange.oldVal == undefined) {
            var policyEl = policyIndicatorKeyToEl[policyChange.key];
            policyEl.addClass("new").hide().slideDown();
        } else {
            var bar = function (policyEl, newVal) {
                policyEl.find(".value").slideUp(function () {
                    policyEl.addClass('changed');
                    $(this).text(newVal).delay(200).slideDown();
                });
            };
            bar(policyIndicatorKeyToEl[policyChange.key], policyChange.newVal);
        }
    }
}

function slideDown_HideOnScroll(el, cb) {
    el.slideDown(function () {
        var cleanupOnScroll = function () {
            el.slideUp();
            $(window).off("scroll", cleanupOnScroll);
            $(document).off("click", cleanupOnScroll);
            $(document).off("keypress", cleanupOnScroll);
        }
        $(window).on("scroll", cleanupOnScroll);
        $(document).on("click", cleanupOnScroll);
        $(document).on("keypress", cleanupOnScroll);

        cb();
    });
}

function updatePolicyIndicator(newPolicy, policyChanges) {
    policyChanges = policyChanges || [];

    if (DEBUG) {
        var line = DEBUG_boxEl.find(".line").first();
        foreachPolicyIn(newPolicy, function (key, value) {
            line.find(".key").val(key);
            line.find(".value").val(value);
            line = line.next(".line");
        });
    }

    // first go through and create the necessary new policy elements....
    var policiesEl = indicatorEl.find(".policies");
    policiesEl.find(".policy").removeClass("new").removeClass("changed");
    policiesEl.find(".change-indicator").fadeOut("fast");

    foreachPolicyIn(newPolicy, function (key, value) {
        var policyEl = policyIndicatorKeyToEl[key];
        if (policyEl == undefined) {
            policyEl = $("<div class='policy'><div class='key'></div><div class='value-box'><div class='value'></div></div></div>");
            policyEl.find(".key").text(key);
            policyEl.find(".value").text(value);

            policyIndicatorKeyToEl[key] = policyEl;
            policiesEl.append(policyEl);
        }
    });


    // now highlight any policyChanges
    if (policyChanges.length > 0) {
        slideDown_HideOnScroll(policiesEl, function () {
            animatePolicyChanges(policyChanges);
        });
    }
}

function setPolicy(newPolicy) {
    if (newPolicy === null) newPolicy = {};
    var policyChanges = getPolicyChanges(currentConfidentialityPolicy, newPolicy);
    if (policyChanges.length > 0) {
        sessionStorage.setItem('currentConfidentialityPolicy', JSON.stringify(newPolicy));
        currentConfidentialityPolicy = newPolicy;
    } else {
        console.log("No changes to the policy...");
    }
    updatePolicyIndicator(newPolicy, policyChanges);
}

function getCurrentConfidentalityPolicy() {
    return currentConfidentialityPolicy;
}

function initialize(parentEl) {
    indicatorEl = $("<div class='nz-confidentiality-indicator'><div class='tab'><div class='title'>Data Confidentiality</div></div><div class='policies'></div></div>");
    indicatorEl.find(".tab").on("click", function () {
        indicatorEl.find(".policies").slideToggle();
    });

    if (DEBUG) {
        var boxLine = "<div class='line'><input class='key'/><input class='value'/></div>"
        DEBUG_boxEl = $("<div id='debug-box'><h3>Confidentiality Demo</h3>" + boxLine + boxLine + boxLine + boxLine + boxLine + boxLine + boxLine + "<input type='submit' value='Change Policy'/></div>");
        var noProp = function (e) { e.stopPropagation(); }
        DEBUG_boxEl.on("click", noProp).on("keypress", noProp);
        DEBUG_boxEl.find("input[type='submit']").on("click", function (e) {
            var newPolicy = {}
            DEBUG_boxEl.find(".line").each(function () {
                var key = $(this).find(".key").val();
                var value = $(this).find(".value").val();
                if (key == "") return;
                newPolicy[key] = value;
            });
            confidentialityIndicator.setPolicy(newPolicy);
        });
        DEBUG_boxEl.appendTo(parentEl);
    }

    updatePolicyIndicator(getCurrentConfidentalityPolicy());
    indicatorEl.appendTo(parentEl);
}

var confidentialityIndicator = {
    setPolicy: setPolicy,
    initialize: initialize,
    getPolicy: getCurrentConfidentalityPolicy
};

export default confidentialityIndicator;

// Discussion
// window.confidentialityIndicator.setPolicy({ "Your Participation": "Public", "Your Responses (anonymized)": "Public", "Your Responses (attributed)": "Panel Only", "You're Annoying": "Confidential" })

// Elicitation
// window.confidentialityIndicator.setPolicy({ "Your Participation": "Public", "Your Responses (anonymized)": "Panel Only", "Your Responses (attributed)": "Confidential", "You're Annoying": "Confidential"})
