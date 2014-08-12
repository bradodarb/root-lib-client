/* Brad Murry*/
;
"use strict";
var SW = SW || {factory: {}};

SW.factory = SW.factory || {};
SW.factory.viewContextFactory = SW.factory.viewContextFactory || {};
SW.v = SW.v || {};
SW.v.transitions = SW.v.transitions || {};
SW.v.transitions.default = function (dom, context) {
    $(dom).hide(); $(dom).fadeIn(1000);
};
//Factory Methods  (Interface)

/*
	Interface for application level view container
	Handles view template assignment by viewmodel type
	Supports multiple view contexts for nested / contextual view templates
	Option to pass in an ad-hoc mapping to allow views to override mapping
*/
SW.factory.viewContextFactory.viewContainer  =  function() {

    var args = arguments;
	var obj = SW.factory.getTarget(args);
	this.parent = null;
	
    (function () {

        var _self = this;
        var _options = SW.factory.getOptions(args);
		
		this.register = function(provider){
			provider.parent = _self;
			_self.add( provider.viewContext(),provider );
		};
		
		this.getView = function(itemName, context){
			try{
				if(itemName){
					if(context){
						
						if(typeof context === "string"){
							var item = _self.item(context);
							if(item !== null){//check for a registered context
								return item.getView(itemName);
							}else{				 //context must be the view name
								return context;
							}
						}else if(itemName.typeName){	//passed in dynamic context with VM as key
							var vmname = itemName.typeName();
							if(context[vmname]){	
								return context[vmname];
							}
						}else if(context[itemName]){	//passed in dynamic context with string as key
							return context[itemName];
						}
					}else{//loop (backwards) through the providers to find a view
						
						var providers = _self.getValues();
						var len = _self.count() - 1;
						var view = null
						for( var i = len; i > -1; i--){
							var view = providers[i].getView(itemName);
							if(view !== null){
								return view;
							}
						}
						
					}
				}
			}catch (err){
				return "error";
			}
			return itemName || "default";
		};


    }).apply(obj, args);
	
	return obj;
};

/*
	Interface for individual view contexts
	Pass in a viewmodel or it's name and recieve the template name
*/
SW.factory.viewContextFactory.viewProvider  =  function() {

    var args = arguments;
	var obj = SW.factory.getTarget(args);
	
    (function () {

        var _self = this;
        var _options = SW.factory.getOptions(args);
			
		var _viewContext = _options.viewContext || 'default';
		var _registeredViews = [];
		
		this.parent = null;
		this.viewContext = function(){
			return _viewContext;
		};
		
		this.getView = function(vm){
			try{
				if(vm.typeName){
					return _self.item(vm.typeName())
				}else{
					return _self.item(vm);
				}
				return null;
			}catch (err){
				return null;
			}
		};

		
		this.register = function(itemName, templateName){
			_self.add(itemName, templateName);
			return this;
		};

		
    }).apply(obj, args);
	
	return obj;
};



//Module Objects

/*
	Ctor for view provider
*/
SW.v.ViewProvider = function(options){

	SW.factory.collections.iCollection(this, options);
	SW.factory.viewContextFactory.viewProvider(this, options);
};

/*
	Ctor for view container
*/
SW.v.ViewContainer = function(options){

	SW.factory.collections.iCollection(this, options);
	SW.factory.viewContextFactory.viewContainer(this, options);
};