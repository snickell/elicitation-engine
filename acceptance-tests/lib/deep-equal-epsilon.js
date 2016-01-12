/* Derived from nodeunit/lib/assert.js, which is under the MIT license, see below: */

/*
Copyright (c) 2010 Caolan McMahon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var pSlice = Array.prototype.slice;
var _keys = function (obj) {
    if (Object.keys) return Object.keys(obj);
    if (typeof obj != 'object' && typeof obj != 'function') {
        throw new TypeError('-');
    }
    var keys = [];
    for (var k in obj) {
        if (obj.hasOwnProperty(k)) keys.push(k);
    }
    return keys;
};


// 7. The equivalence assertion tests a deep equality relation, modulo epsilon for floating point numbers
// assert.deepEqual(actual, expected, message_opt);

function deepEqualEpsilon(actual, expected, epsilon, fail, message) {
    if (!_deepEqualEpsilon(actual, expected, epsilon)) {
        fail(actual, expected, message, "deepEqualEpsilon", deepEqualEpsilon);
    }
};

function _equalEpsilon(actual, expected, epsilon) {
    if (actual == expected) {
        return true;
    } else {
        return Math.abs(actual - expected) / (Math.abs(actual) + Math.abs(expected)) < epsilon;
    }
}

var Buffer = null;
if (typeof require !== 'undefined' && typeof process !== 'undefined') {
    try {
        Buffer = require('buffer').Buffer;
    }
    catch (e) {
        // May be a CommonJS environment other than Node.js
        Buffer = null;
    }
}

function _deepEqualEpsilon(actual, expected, epsilon) {
    // 7.1. All identical values are equivalent, as determined by ===.
    if (actual === expected) {
        return true;
        // 7.2. If the expected value is a Date object, the actual value is
        // equivalent if it is also a Date object that refers to the same time.
    } else if (actual instanceof Date && expected instanceof Date) {
        return actual.getTime() === expected.getTime();

        // 7.2.1 If the expcted value is a RegExp object, the actual value is
        // equivalent if it is also a RegExp object that refers to the same source and options
    } else if (actual instanceof RegExp && expected instanceof RegExp) {
        return actual.source === expected.source &&
               actual.global === expected.global &&
               actual.ignoreCase === expected.ignoreCase &&
               actual.multiline === expected.multiline;

    } else if (Buffer && actual instanceof Buffer && expected instanceof Buffer) {
        return (function () {
            var i, len;

            for (i = 0, len = expected.length; i < len; i++) {
                if (actual[i] !== expected[i]) {
                    return false;
                }
            }
            return actual.length === expected.length;
        })();

        // MODIFIED BY SETH HERE: we detect numbers, and check if they are epsilon-equal
    } else if ((typeof(actual) == "number" || actual instanceof Number) && (typeof(expected) == "number" || expected instanceof Number)) {
        return _equalEpsilon(expected, actual, epsilon);

        // 7.3. Other pairs that do not both pass typeof value == "object",
        // equivalence is determined by ==.
    } else if (typeof actual != 'object' && typeof expected != 'object') {
        return actual == expected;

        // 7.4. For all other Object pairs, including Array objects, equivalence is
        // determined by having the same number of owned properties (as verified
        // with Object.prototype.hasOwnProperty.call), the same set of keys
        // (although not necessarily the same order), equivalent values for every
        // corresponding key, and an identical "prototype" property. Note: this
        // accounts for both named and indexed properties on Arrays.
    } else {
        return objEquivEpsilon(actual, expected, epsilon);
    }
}

function isUndefinedOrNull(value) {
    return value === null || value === undefined;
}

function isArguments(object) {
    return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquivEpsilon(a, b, epsilon) {
    if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
        return false;
    // an identical "prototype" property.
    if (a.prototype !== b.prototype) return false;
    //~~~I've managed to break Object.keys through screwy arguments passing.
    //   Converting to array solves the problem.
    if (isArguments(a)) {
        if (!isArguments(b)) {
            return false;
        }
        a = pSlice.call(a);
        b = pSlice.call(b);
        return _deepEqual(a, b);
    }
    try {
        var ka = _keys(a),
          kb = _keys(b),
          key, i;
    } catch (e) {//happens when one is a string literal and the other isn't
        return false;
    }
    // having the same number of owned properties (keys incorporates hasOwnProperty)
    if (ka.length != kb.length)
        return false;
    //the same set of keys (although not necessarily the same order),
    ka.sort();
    kb.sort();
    //~~~cheap key test
    for (i = ka.length - 1; i >= 0; i--) {
        if (ka[i] != kb[i])
            return false;
    }
    //equivalent values for every corresponding key, and
    //~~~possibly expensive deep test
    for (i = ka.length - 1; i >= 0; i--) {
        key = ka[i];
        if (!_deepEqualEpsilon(a[key], b[key], epsilon))
            return false;
    }
    return true;
}

exports.deepEqualEpsilon = deepEqualEpsilon;
exports.areEqualEpsilon = _equalEpsilon;