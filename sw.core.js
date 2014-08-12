/* Brad Murry*/
;
"use strict";
//thanks IE....
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        if (this == null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 1) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    }
}




var SW = SW || {};
SW.factory = SW.factory || {};
SW.util = SW.util || {};
SW.serialization = SW.serialization || {};

SW.factory.collections = SW.factory.collections || {};
SW.collections = SW.collections || {};


SW.factory.getTarget = function (args, name) {

    if (args) {
        var result = (args.length) > 1 ? args[0] : {};
        if (name) {
            if (!result.typeName) {
                SW.vm.ViewModel.call(result, { typeName: name });
            }
        }
        return result;
    } else {
        return null;
    }
};
SW.factory.getOptions = function (args) {

    if (args) {
        return (args.length) === 1 ? args[0] || {} : (args.length) > 1 ? args[1] || {} : {};
    } else {
        return null;
    }
};

SW.util.propVal = function (prop) {
    if (SW.util.isFunction(prop)) {
        return prop();
    } else {
        return prop;
    }
};

SW.util.setProp = function (prop, val) {
    if (SW.util.isFunction(prop)) {
        prop(val);
    } else {
        prop = val;
    }
};

SW.util.isFunction = function (functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
};

SW.util.wasSameDomain = function (url) {
    if (!url) {
        url = window.document.referrer;
    }
    return url.indexOf(window.location.protocol + "//" + window.location.host) === 0;
}

SW.util.getValueOrDefault = function (prop, defaultVal) {

    if (typeof (prop) !== "undefined" && prop !== null) {
        return SW.util.propVal(prop);
    }
    return defaultVal;
}

SW.util.endsWith = function (target, query, ignoreCase) {
    if (ignoreCase) {
        target = target.toLowerCase();
        query = target.toLowerCase();
    }
    return target.indexOf(query, target.length - query.length) !== -1;
};
//Factory Methods  (Interface)
    /*
        Interface for a container object.  The primary purpose is to maintain a persistent relationship between
        the object's properties and their keys since older browsers do not support getKeys
    */

SW.factory.collections.iCollection = function () {

    var args = arguments;
    var obj = SW.factory.getTarget(args);

    (function () {

        var _self = this;
        var _options = SW.factory.getOptions(args);

        var _list = [];

        this.item = function (key) {

            return _self[key] || null;
        };

        this.containsKey = function (key) {
            var item = _self.item(key);
            return item !== null;
        };

        this.count = function () {

            return _list.length;
        };

        this.add = function (key, item) {
            if (!_list[key]) {
                _list.push(key);
            }
            _self[key] = item;
        };

        this.remove = function (key) {

            var index = _list.indexOf(key);
            while (index > -1) {
                if (_self[_list[index]]) {
                    delete _self[_list[index]]
                }
                _list.splice(index, 1);
                index = _list.indexOf(key);
            }
        };

        this.clear = function () {
            var len = _self.count();

            for (var i = 0; i < len; i++) {
                _self.remove(_list[i]);
            }
            _list = [];
        };

        this.indexOf = function (item) {

            if (typeof item === "string") {
                return _list.indexOf(item);
            } else {
                var len = _list.length;

                for (var i = len - 1; i >= 0; i--) {
                    if (_self[_list[i]] == item) {
                        return i;
                    }
                };
            }
        };

        this.first = function () {

            if (_list.length > 0) {

                return _self[_list[0]];

            }
            return null;
        };

        this.last = function () {

            var len = _list.length;
            if (len > 0) {

                return _self[_list[len - 1]];
            }
            return null;
        };

        this.getKeys = function () {
            var keys = [];
            var len = _list.length;
            for (var i = 0; i < len; i++) {
                keys.push(_list[i]);
            }
            return keys;
        };

        this.getValues = function () {
            var values = [];
            var len = _list.length;
            for (var i = 0; i < len; i++) {
                var value = _self[_list[i]] || null;
                if (value !== null) {
                    values.push(value);
                }
            }
            return values;
        };

    }).apply(obj, args);

    return obj;
};





SW.collections.Collection = function(options){

    SW.factory.collections.iCollection(this, options);
}

SW.serialization.localSet = function (key, data) {
    localStorage[key] = JSON.stringify(data);
};

SW.serialization.localGet = function (key) {
    var data = localStorage[key];
    if (data) {
        return JSON.parse(data);
    } else {
        return null;
    }
};
SW.serialization.sessionSet = function (key, data) {
    sessionStorage[key] = JSON.stringify(data);
};

SW.serialization.sessionGet = function (key) {
    var data = sessionStorage[key];
    if (data) {
        return JSON.parse(data);
    } else {
        return null;
    }
};