/* Brad Murry*/
;
"use strict";
var SW = SW || {};
SW.factory = SW.factory || {};

SW.factory.collectionsViewModelFactory = SW.factory.collectionsViewModelFactory || {};
SW.vm = SW.vm || {};
SW.vm.collections = SW.vm.collections || {};

//Emulates IObservableCollection similar to WPF

SW.factory.collectionsViewModelFactory.collectionViewModel = function() {

    var args = arguments;
    var obj = SW.factory.getTarget(args, "Collection");
	
    (function () {

        var _self = this;
        var _options = SW.factory.getOptions(args);
		
		this.items = _options.items || ko.observableArray();
		
		this.add = _options.add || function(item){
			_self.items.push(item);
		};
		this.remove = _options.remove || function(item){
			_self.items.remove(item);
		};
		this.removeMany = _options.remove || function(items){
			_self.items.removeAll(items);
		};
	
		this.clear = _options.clear || function(){
			_self.items.removeAll();
		};
		
	}).apply(obj, args);
	
	return obj;
};

SW.factory.collectionsViewModelFactory.selectableCollectionViewModel = function() {

    var args = arguments;
    var obj = SW.factory.getTarget(args, "SelectableCollection");
	
    (function () {

        var _self = this;
        var _options = SW.factory.getOptions(args);
		
        this.onSelecting = _options.onSelecting || null;
        this.onSelected = _options.onSelected || null;

        this.onDeselecting = _options.onDeselecting || null;
        this.onDeselected = _options.onDeselected || null;

		this.currentItem = ko.observable(null);
		
		this.select = _options.select || function (item) {

		    if (_self.onSelecting !== null) {
		        _self.onSelecting(item);
		    }

		    _self.currentItem(item);

		    if (_self.onSelected !== null) {
		        _self.onSelected(item);
		    }
		};
		
		this.selectAt = _options.selectAt || function(index){
			
		    var item = _self.items()[index]
		    return _self.select(item);

		};
		
		this.deselect = _options.deselect || function () {

		    if (_self.onDeselecting !== null) {
		        _self.onDeselecting();
		    }

		    _self.currentItem(null);

		    if (_self.onDeselected !== null) {
		        _self.onDeselected();
		    }
		};

		this.clear = _options.clear || function () {
		    _self.deselect();
		    _self.items.removeAll();
		}
	}).apply(obj, args);
	
	return obj;
};

SW.factory.collectionsViewModelFactory.multiSelectableCollectionViewModel = function() {

    var args = arguments;
    var obj = SW.factory.getTarget(args, "MultiSelectCollection");
	
    (function () {

        var _self = this;
        var _options = SW.factory.getOptions(args);
		

		
		this.selectedItems = ko.observableArray();
		this.currentItem = ko.observable(null);
		
		
		this.select = _options.select || function(item){
		
			_self.currentItem(item);
			if (_self.selectedItems.indexOf(item) < 0) {
				_self.selectedItems.push(item);
			}
		};
		
		this.selectAt = _options.selectAt || function(index){
		
			var item = _self.items()[index];
			_self.currentItem(item);
			if (_self.selectedItems.indexOf(item) < 0) {
				_self.selectedItems.push(item);
			}
		};
		this.selectAll = _options.selectAll || function(item){
		
			_self.selectedItems.removeAll();
			var itemsToSelect = _self.items()
			var len = itemsToSelect.length;
			for(var i = 0; i < len; i++){
				_self.selectedItems.push(itemsToSelect[i]);
			}
		};
		
		this.deselect = _options.deselect || function(item){
		
			_self.currentItem(null);
			if (_self.selectedItems.indexOf(item) < 0) {
				_self.selectedItems.remove(item);
			}
		};
		this.deSelectAt = _options.deSelectAt || function(index){
		
			var item = _self.items()[index];
			_self.currentItem(null);
			if (_self.selectedItems.indexOf(item) < 0) {
				_self.selectedItems.remove(item);
			}
		};
		this.clearSelections = _options.clearSelections || function(){
		    _self.deselect();
			_self.selectedItems.removeAll();
		};
		this.clear = _options.clear || function () {
		    _self.clearSelections();
		    _self.items.removeAll();
		}
	}).apply(obj, args);
	
	return obj;
};





SW.vm.collections.ViewModelCollectionBase = function(options){
	SW.factory.collectionsViewModelFactory.collectionViewModel(this, options);
}

SW.vm.collections.viewModelSelectableCollectionBase = function(options){
	SW.factory.collectionsViewModelFactory.collectionViewModel(this, options);
	SW.factory.collectionsViewModelFactory.selectableCollectionViewModel(this, options);
}

SW.vm.collections.viewModelMultiSelectCollectionBase = function(options){
	SW.factory.collectionsViewModelFactory.collectionViewModel(this, options);
	SW.factory.collectionsViewModelFactory.multiSelectableCollectionViewModel(this, options);
}