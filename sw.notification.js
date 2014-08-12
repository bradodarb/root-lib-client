/* Brad Murry*/
;
"use strict";
var SW = SW || {};
SW.factory = SW.factory || {};
SW.factory.notification = SW.factory.notification || {};
SW.notify = SW.notify || {};

SW.factory.notification.messageDispatcher =  function() {

    var args = arguments;
	var obj = SW.factory.getTarget(args);
	
    (function () {

        var _self = this;
        var _options = SW.factory.getOptions(args);
		
		
		var _infoHandlers = _options.infoHandlers || SW.factory.collections.iCollection();
		var _warningHandlers = _options.warningHandlers || SW.factory.collections.iCollection();
		var _errorHandlers = _options.errorHandlers ||  SW.factory.collections.iCollection();

		this.handleInfo = function(title, message, details){
			var handlers = _infoHandlers.getValues();
			broadcast(handlers, title, message, details);
		};
		this.handleWarn = function(title, message, details){
			var handlers = _warningHandlers.getValues();
			broadcast(handlers, title, message, details);
		};
		this.handleError = function(title, message, details){
			var handlers = _errorHandlers.getValues();
			broadcast(handlers, title, message, details);
		};
		
		
		
		this.registerInfoLogger = function(name, logger){
			_infoHandlers.add(name, logger);
		};
		this.registerWarnLogger = function(name, logger){
			_warningHandlers.add(name, logger);
		};
		this.registerErrorLogger = function (name, logger) {
			_errorHandlers.add(name, logger);
		};
		
		function broadcast(handlers, title, message, details){
		
			var len = handlers.length;
			for(var i = 0; i < len; i++){
				handlers[i].onMessage(title, message, details);
			}
		}
		
		
    }).apply(obj, args);
	
	return obj;
};

SW.factory.notification.logger =  function() {

    var args = arguments;
	var obj = SW.factory.getTarget(args);
	
    (function () {

        var _self = this;
        var _options = SW.factory.getOptions(args);
		
		
		var messageHandler = _options.messageHandler || null;
		
		this.onMessage = function(title, message, details){
			if(messageHandler !== null){
				messageHandler(title, message, details);
			}
		};
	
    }).apply(obj, args);
	
	return obj;
};




/*
	Ctor for Messenger
*/
SW.notify.Messenger = function(options){
	SW.factory.notifications.messageDispatcher(this, options);
}

/*
	Ctor for Logger
*/
SW.notify.Logger = function(options){
	SW.factory.notifications.logger(this, options);
}