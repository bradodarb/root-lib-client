/* Brad Murry*/
;
"use strict";
var SW = SW || {};
SW.factory = SW.factory || {};
SW.factory.navigationFactory = SW.factory.navigationFactory || {};
SW.nav = SW.nav || {};


//Factory Methods  (Interface)

SW.factory.navigationFactory.navigationItemViewModel = function () {

    var args = arguments;
    var obj = SW.factory.getTarget(args, "NavigationItem");
	
    (function () {

        var _self = this;
        var _options = SW.factory.getOptions(args);

        this.title = ko.observable(_options.title || "");
        this.toolTip = ko.observable(_options.toolTip || "");
        this.icon = ko.observable(_options.icon || "");
        this.image = ko.observable(_options.image || "");

        this.disabled = ko.observable(_options.disabled || false);
        this.visible = ko.observable(_options.visible || true);

        this.click = _options.click || function () {
            
        };
        this.hover = _options.hover || function () {

        };

        this.pack = function () {
            _self.title("");
        };

        this.unPack = function () {
            _self.title(_options.title || "");
        };

	}).apply(obj, args);
	
    return obj;

};

//Module Objects

SW.nav.NavigationItemViewModel = function (options) {
    SW.factory.navigationFactory.navigationItemViewModel(this, options);
    SW.factory.collections.iCollection(this, options);
}