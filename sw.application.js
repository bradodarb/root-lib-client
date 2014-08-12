/* Brad Murry*/
;
"use strict";
var SW = SW || {};
SW.factory = SW.factory || {};

SW.factory.applicationFactory = SW.factory.applicationFactory || {};

SW.app= SW.app || {};

//Factory Methods  (Interface)

/*
	Interface for the session object, which is the root object for the system.
	Many pages will only have one application in the session, but it is capable of containing many applications to support 
	SPA's
*/
SW.factory.applicationFactory.session =  function() {

    var args = arguments;
	var obj = SW.factory.getTarget(args);
	
    (function () {

        var _self = this;
        var _options = SW.factory.getOptions(args);
		var domReady = _options.domReady || null;

		var locationArrayKey = 'SW.ApplicationLocation';

		this.current = ko.observable(null); 

		this.init = function(){
		
			var apps = _self.getValues();
			var len = apps.length;

			for (var i = len - 1; i >= 0; i--) {

				apps[i].init();
			};
		};
		
		this.register = function(app){
			app.parent = _self;
			_self.add(app.appName(),app );
		};
		
		this.select = function (app) {
		    var prev = _self.current();

		    if (prev !== null) {
		        prev.onRemoving();
			}
			if(typeof app == "string"){
				var current = _self.item(app);
				if(current !== null){
				    _self.current(current);
				    current.onSelected();
				}
			}else if(app.appName && app.onSelected){
			    _self.current(app);
			    app.onSelected();
			}else{
				throw "Invalid Assignment Operation | supplied argument is not an Application";
			}
		};

		this.queueLocation = function () {
		    var locations = SW.serialization.sessionGet(locationArrayKey);
		    var alreadyThere = false;
		    if (!locations) {
		        locations = [];
		    }
     
		    if (locations.length > 0) {
		        var last = locations[locations.length - 1];
		        if (last.toLowerCase() === window.location.href.toLowerCase()) {
		            alreadyThere = true;
		        }
		    }

		    if (!alreadyThere) {
		        locations.push(window.location.href);
		        SW.serialization.sessionSet(locationArrayKey, locations);
		    } else {
		        return false;
		    }
		    return true;
		};

		this.deQueueLocation = function () {
		    var locations = SW.serialization.sessionGet(locationArrayKey);
		    var destination = window.location.href;
		    var target = destination;
		    if (locations && locations.length > 0) {
		        while (locations.length > 0 && target.toLowerCase() === destination.toLowerCase()) {
		            target = locations.pop();
		        }
		        SW.serialization.sessionSet(locationArrayKey, locations);
		        destination = target;
		    }

		    return destination;
		};
		
		$(document).ready(function(){
 
			if(domReady !== null){
				domReady.call(_self);
				var apps = _self.getValues();
				var len = apps.length;
				for(var i = 0; i < len; i++){
				
					if(apps[i].domReady){
					
						apps[i].domReady();
					
					}
				
				}
			}
		});
		
    }).apply(obj, args);
	
	return obj;
};


/*
	Interface to implement an application.  The application manages one or more viewmodels, and also controls the view context for each viewmodel
	Server data is managed with set of data context objects for uniform access
*/
SW.factory.applicationFactory.application =  function() {

    var args = arguments;
	var obj = SW.factory.getTarget(args);
	
    (function () {

        var _self = this;
        var _options = SW.factory.getOptions(args);
        var _appName = _options.appName || 'application';
		
		
		var initM = _options.initM || null;
		var initV = _options.initV || null;
		var initVM = _options.initVM || null;
		
		var applyBindings = _options.applyBindings || null;
		var removeBindings = _options.removeBindings || null;
		
		this.parent = null;
		
		this.M = _options.M || null;
		this.V = _options.V || null;
		this.VM = _options.VM || null;
		
		this.messenger = _options.messenger || null;

		this.rootVM = ko.observable(null);
		this.rootV = ko.observable(null);
		this.rootTemplate = ko.observable(null);

		this.appName = function(){

			return _appName;
		};
		
		//This is fired once per session
		this.init = function () {

			if(_self.M === null){
				_self.M = new SW.dc.DataContextManager(_options);
			
			}
			_self.M.app = _self;
			
			if(_self.V === null){
				_self.V = new SW.v.ViewContainer(_options);
				
			}
			_self.V.app = _self;
			
			if(_self.VM === null){
				_self.VM = new SW.vm.ViewModelManager(_options);
			}
			_self.VM.app = _self;
			
			if(initM !== null){
				initM.call(_self);
			}
			if(initV !== null){
				initV.call(_self);
			}
			if(initVM !== null){
				initVM.call(_self);
			}
			



			if(_self.rootVM() === null && _self.VM.count() > 0){
				var vmobj = _self.VM.first();
				_self.rootVM(vmobj);
				_self.rootV(_self.V.getView(vmobj));
			
			}
		};

		//This is fired each time the application is moved to the 'current' position
		this.onSelected = function(){
		
			if(applyBindings !== null){
				applyBindings.call(_self);
			}
			var vms = _self.VM.getValues();
			var len = vms.length;
			
			for(var i = 0; i < len; i++){
			
				vms[i].applyBindings();
			
			}
		
		};
		
		//This is fired each time before the application is removed from the 'current' position
		this.onRemoving = function(){
			
			if(removeBindings !== null){
				removeBindings.call(_self);
			}
			var vms = _self.VM.getValues();
			var len = vms.length;
			
			for(var i = 0; i < len; i++){
			
				vms[i].removeBindings();
			
			}
		
		};

		this.setRootVM = function(vm){
			
			if(vm){
				if(typeof vm == "string"){
					var vmobj = _self.VM.item(vm);
					if (vmobj !== null) {
					    //_self.rootVM(null);
						_self.rootV(_self.V.getView(vmobj));
						_self.rootVM(vmobj);
					}
				} else if (vm.typeName) {
				   // _self.rootVM(null);
					_self.rootV(_self.V.getView(vm));
					_self.rootVM(vm);
				}
			}
			_self.rootTemplate({ name: _self.rootV(), data: _self.rootVM() });
		};
		


		//Convienience method to query view type requests
		//Really just here to make the bindings cleaner in the view
		this.view = function(vm, context){
			return _self.V.getView(vm, context);
		};
		
		//Convienience method to query viewModel requests
		//Really just here to make the bindings cleaner in the view
		this.data = function(vm){
			return _self.VM.item(vm);
		};
		
    }).apply(obj, args);
	
	return obj;
};



//Module Objects

/*
	Ctor for view application
*/
SW.app.Application = function(options){

	SW.factory.collections.iCollection(this, options);
	SW.factory.applicationFactory.application(this, options);
};

/*
	Ctor for view session
*/
SW.app.Session = function(options){

	SW.factory.collections.iCollection(this, options);
	SW.factory.applicationFactory.session(this, options);
};