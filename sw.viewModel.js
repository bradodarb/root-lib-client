/* Brad Murry*/
;
"use strict";
var SW = SW || {};
SW.factory = SW.factory || {};

SW.factory.viewModelFactory = SW.factory.viewModelFactory || {};
SW.vm = SW.vm || {};



//Factory Methods  (Interface)

/*
	Interface implementing a container for all viewmodels within a given application object
*/
SW.factory.viewModelFactory.viewModelManager =  function() {

    var args = arguments;
	var obj = SW.factory.getTarget(args);
    (function () {

        var _self = this;
        var _options = SW.factory.getOptions(args);
		this.app = null;
		
		this.register = function(name, vm){
		
			var vmobj = vm || {};
			
			if(!vmobj.typeName){
				throw "Invalid Assignment Operation | unable to register object that does not implement SW.factory.viewModelFactory.viewModelBase";
			}
			vmobj.app(_self.app);
			_self.add(name, vmobj);

			return _self;
		};
		

	
    }).apply(obj, args);
	
	return obj;
};


/*
	Interface for base Viewmodel objects
	Implements typeName for resolving the view context
	Supports node level binding
*/
SW.factory.viewModelFactory.viewModelBase =  function() {

    var args = arguments;
	var obj = SW.factory.getTarget(args);
	
    (function () {

        var _self = this;
        var _options = SW.factory.getOptions(args);
		
		var _typeName = _options.typeName || null;
		var _nodeContext = null;
		var _children = [];
		var _app = null;
		var _areCommandsRegistered = false;

		this.app = function () {
		    if (arguments.length > 0) {
		        _app = arguments[0];
		        _self.onActivateCommands();
		        var length = _children.length;
		        for (var i = 0; i < length; i++) {
		            _children[i].app(_app);
		        }
		    } else {
		        return _app;
		    }
		};
		
		this.init = function(){
			var node = _options.nodeContext || null;
			if(node !== null ){
				_nodeContext = $(node);
			}
		};
		
		this.typeName = function(){
			if(arguments.length > 0 && typeof arguments[0] == "string"){
				if(_typeName === null){
					_typeName = arguments[0];
				}else{
					throw "typeName can only be set once per instance"
				}
			}else{
				return _typeName;
			}
		};
		
		this.nodeContext = function(){
			return _nodeContext;
		};

		this.applyBindings = function(){
			if(_nodeContext !== null){

				ko.applyBindings(_self, $(_nodeContext)[0]);
			}
		};
		
		this.removeBindings = function(){
			if(_nodeContext !== null){
			
				ko.cleanNode($(_nodeContext)[0]);
			}
		};
		
		this.register = function (name, vm) {
            
		    if (vm) {
		        if (!vm.typeName) {
		            throw "Invalid Assignment Operation | unable to register object that does not implement SW.factory.viewModelFactory.viewModelBase";
		        }
		        vm.app(_self.app);
		        _self[name] = vm;

		        if (_children.indexOf(vm) < 0) {
		            _children.push(vm);
		        }
		    }
		    return _self;
		};
		this.registerObservable = function (name, value) {

		    if (_children.indexOf(vm) < 0) {
		        var vm = ko.observable(value);
		        _self[name] = vm;
		        _children.push(vm);
		    }

		    return _self;
		};
		this.activateCommands = _options.activateCommands || function () {

		};

		this.onActivateCommands = function () {
		    if (!_areCommandsRegistered) {

		        _self.activateCommands();

		        _areCommandsRegistered = true;
		    }
		};
	}).apply(obj, args);
	
	return obj;
};





//Module Objects

/*
	Ctor for view model
*/
SW.vm.ViewModel = function(options){
	SW.factory.viewModelFactory.viewModelBase(this, options);
};

/*
	Ctor for view manager
*/
SW.vm.ViewModelManager = function(options){
	SW.factory.collections.iCollection(this, options);
	SW.factory.viewModelFactory.viewModelManager(this, options);
};