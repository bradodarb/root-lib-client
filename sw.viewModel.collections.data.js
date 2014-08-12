/* 
Brad Murry
Implements collection interface using an underlying data context
*/
;
"use strict";
var SW = SW || {};
SW.factory = SW.factory || {};

SW.factory.dataCollectionsViewModelFactory = SW.factory.dataCollectionsViewModelFactory || {};

SW.vm = SW.vm || {};
SW.vm.collections = SW.vm.collections || {};
SW.vm.collections.data = SW.vm.collections.data || {};

SW.factory.dataCollectionsViewModelFactory.dataAccessorCollectionViewModelBase =  function() {

    var args = arguments;
    var obj = SW.factory.getTarget(args, "AccessorCollection");
	
    (function () {

        var _self = this;
        var _options = SW.factory.getOptions(args);
		
		var _dataContext = _options.dataContext || null;
		
		var _collection = _options.collection || null;

		this.onGet = _options.onGet || null;
		this.onGetComplete = _options.onGetComplete || null;

		this.onGetMany = _options.onGetMany || null;
		this.onGetManyComplete = _options.onGetManyComplete || null;
		
		this.onGetAll = _options.onGetAll || null;
		this.onGetAllComplete = _options.onGetAllComplete || null;
		

		this.onCreate = _options.onCreate || null;

		this.dataContext = function(){
			return _dataContext;
		};

		this.get = function (id, callback) {

		    if (_self.onGet) {
		        _self.onGet(id);
		    }
		    _self.dataContext().get(id, function (data) {

		        var result = ko.mapping.fromJS(data, {});

		        if (_self.onCreate && SW.util.isFunction(_self.onCreate)) {
		            _self.onCreate(result);
		        }

		        if (_self.onGetComplete) {
		            _self.onGetComplete(data);
		        }
		        if (SW.util.isFunction(callback)) {
		            callback(result);
		        }
		    });

		};

		this.getMany = function (ids, callback) {

			if(_self.onGetMany){
				_self.onGetMany(ids);
			}
			var context = _self.dataContext();
			context.getMany(ids, function (data) {
			
			    ko.mapping.fromJS(data.items, {}, _self.collection.items);

			    if (_self.onCreate && SW.util.isFunction(_self.onCreate)) {
				    ko.utils.arrayForEach(_self.collection.items(), function (vm) {
				        _self.onCreate(vm);
				    });
				}

				if(_self.onGetManyComplete){
					_self.onGetManyComplete(data.items);
				}
				if (SW.util.isFunction(callback)) {
				    callback(_self.collection.items);
				}
			});
		
		};
		
		this.getAll = function (callback) {
		
			if(_self.onGetAll){
				_self.onGetAll(item);
			}	
			
			_self.dataContext().getAll(function(data){
			
			    ko.mapping.fromJS(data.items, {}, _self.collection.items);

			    if (_self.onCreate && SW.util.isFunction(_self.onCreate)) {
			        ko.utils.arrayForEach(_self.collection.items(), function (vm) {
			            _self.onCreate(vm);
			        });
			    }

				if(_self.onGetAllComplete){
					_self.onGetAllComplete(data.items);
				}
				if (SW.util.isFunction(callback)) {
				    callback(_self.collection.items);
				}
			});
		
		};
         
		this.getFrom = function (url, callback, param) {

		    _self.dataContext().exeGET(url, function (data) {

		        var result = ko.mapping.fromJS(data, {});

		        if (_self.onCreate && SW.util.isFunction(_self.onCreate)) {
		            _self.onCreate(result);
		        }

		        if (SW.util.isFunction(callback)) {
		            callback(result);
		        }

		    }, ': Could not get item! ' + url, param);
		};

		this.getManyFrom = function (url, callback) {
		 
		    var context = _self.dataContext();
		    context.exeGET(url, function (data) {

		        ko.mapping.fromJS(data.items, {}, _self.collection.items);

		        if (_self.onCreate && SW.util.isFunction(_self.onCreate)) {
		            ko.utils.arrayForEach(_self.collection.items(), function (vm) {
		                _self.onCreate(vm);
		            });
		        }

		        if (SW.util.isFunction(callback)) {
		            callback(_self.collection.items);
		        }
		    }, ': Could not get items! ' + url);
		};

		if (_collection !== null) {
		    this.register('collection', _collection);
		}
	}).apply(obj, args);
	
	return obj;
};

SW.factory.dataCollectionsViewModelFactory.dataAdminCollectionViewModelBase =  function() {

    var args = arguments;
    var obj = SW.factory.getTarget(args, "AdminCollection");
	
    (function () {

        var _self = this;
        var _options = SW.factory.getOptions(args);
		
		var _dataContext = _options.dataContext || null;
		
		this.collection = _options.collection || null;
		
		this.onCreating = _options.onCreating || null;
		this.onCreated = _options.onCreated || null;
		
		this.onUpdating = _options.onUpdating || null;
		this.onUpdated = _options.onUpdated || null;
		
		this.onRemoving = _options.onRemoving || null;
		this.onRemoved = _options.onRemoved || null;
		

		this.validationHandler = _options.validationHandler || null;
		
		this.dataContext = function(){
			return _dataContext;
		};
		
		this.create = function (item, callback) {

			if(_self.onCreating){
				_self.onCreating();
			}		
			_self.dataContext().create(item, function (data) {
			
			    var newItem = ko.mapping.fromJS(data, {});

			    if (_self.onCreate && SW.util.isFunction(_self.onCreate)) {
			        _self.onCreate(newItem);
			    }
				    _self.collection.add(newItem);

				if(_self.onCreated){
					_self.onCreated(newItem);
				}
				if (SW.util.isFunction(callback)) {
				    callback(newItem);
				}
			});
		
		};
		
		this.update = function (callback) {
		    var item = _self.collection.currentItem();

		    if (item) {
                 
		        var payload = ko.mapping.toJSON(item);
		        if (_self.onUpdating) {
		            _self.onUpdating(item);
		        }
		        _self.dataContext().update(payload, function (data) {

		            //Update the Id, in the event the item was 'new' and is only now a persistent entity
		            SW.util.setProp(item.id, data.id);
		            if (_self.onUpdated) {
		                _self.onUpdated(item);
		            }
		            if (SW.util.isFunction(callback)) {
		                callback(item);
		            }
		        }, _self.validationHandler);
		    }
		};
		
		this.remove = function (item, callback) {

		    if(!item && SW.util.isFunction(_self.collection.currentItem)){
		        item = _self.collection.currentItem();
		    }
		    if (item) {
		        if (SW.util.propVal(item.id) < 1) {
		            return;
		        }

		        if (_self.onRemoving) {
		            _self.onRemoving(item);
		        }

		        _self.dataContext().remove(SW.util.propVal(item.id), function () {

		            _self.collection.remove(item);

		            if (_self.onRemoved) {
		                _self.onRemoved(item);
		            }

		            if (SW.util.isFunction(callback)) {
		                callback(item);
		            }
		        });
		    }
		};


	}).apply(obj, args);
	
	return obj;
};


SW.factory.dataCollectionsViewModelFactory.dataPagingCollectionViewModelBase =  function() {

    var args = arguments;
    var obj = SW.factory.getTarget(args, "PagingCollection");
	
    (function () {

        var _self = this;
        var _options = SW.factory.getOptions(args);
		
		var _dataContext = _options.dataContext || null;
		
		this.collection = _options.collection || null;
		
		this.pageNum = ko.observable(_options.pageNum || 1);
		this.pageSize =  ko.observable(_options.pageSize || 10);
		this.sortField =  ko.observable(_options.sortField || "");
		this.filterField =  ko.observable(_options.filterField || "");
		this.filterPhrase =  ko.observable(_options.filterPhrase || "");
		this.isAscending =  ko.observable(_options.isAscending || false);
		
		this.pageCount =  ko.observable(_options.pageCount || 0);
		this.positionText =  ko.observable(_options.positionText || "");
		this.hasPrevItems =  ko.observable(_options.hasPrevItems || false);
		this.hasNextItems =  ko.observable(_options.hasNextItems || false);
		
		
		
		this.onNext = _options.onNext || null;
		this.onNextComplete = _options.onNextComplete || null;
		
		this.onPrev = _options.onPrev || null;
		this.onPrevComplete = _options.onPrevComplete || null;
		
		this.onGetPage = _options.onGetPage || null;
		this.onGetPageComplete = _options.onGetPageComplete || null;
		


		this.dataContext = function(){
			return _dataContext;
		};
		
		this.next = function (callback) {

			if(_self.onNext){
				_self.onNext();
			}
			updateContextParameters();
			_self.dataContext().next(function(data){
					updateParametersFromContext();
					ko.mapping.fromJS(data, {}, _self.collection.items);

					if (_self.onCreate && SW.util.isFunction(_self.onCreate)) {
					    ko.utils.arrayForEach(_self.collection.items(), function (vm) {
					        _self.onCreate(vm);
					    });
					}

				if(_self.onNextComplete){
					_self.onNextComplete();
				}
				if (SW.util.isFunction(callback)) {
				    callback(_self.collection.items);
				}
			});
		};
		
		this.previous = function (callback) {

			if(_self.onPrev){
				_self.onPrev();
			}
			updateContextParameters();
			_self.dataContext().previous(function(data){
					updateParametersFromContext();
					ko.mapping.fromJS(data, {}, _self.collection.items);

					if (_self.onCreate && SW.util.isFunction(_self.onCreate)) {
					    ko.utils.arrayForEach(_self.collection.items(), function (vm) {
					        _self.onCreate(vm);
					    });
					}

				if(_self.onPrevComplete){
					_self.onPrevComplete();
				}
				if (SW.util.isFunction(callback)) {
				    callback(_self.collection.items);
				}
			});
		};
		
		this.getPage = function (callback) {

			if(_self.onGetPage){
				_self.onGetPage();
			}
			updateContextParameters();
			_self.dataContext().getPage(function(data){
					updateParametersFromContext();
					ko.mapping.fromJS(data, {}, _self.collection.items);

					if (_self.onCreate && SW.util.isFunction(_self.onCreate)) {
					    ko.utils.arrayForEach(_self.collection.items(), function (vm) {
					        _self.onCreate(vm);
					    });
					}

				if(_self.onGetPageComplete){
					_self.onGetPageComplete();
				}
				if (SW.util.isFunction(callback)) {
				    callback(_self.collection.items);
				}
			});
		};

		this.pageByNumber = function (pagenum, callback) {
		
			_self.pageNum(pagenum);
			
			return _self.getPage(callback);
		
		
		};
		
		function updateContextParameters(){
			var context = _self.dataContext();
			
			context.pageNum(_self.pageNum());
			context.pageSize(_self.pageSize());
			context.sortField(_self.sortField());
			context.filterField(_self.filterField());
			context.filterPhrase(_self.filterPhrase());
			context.isAscending(_self.isAscending());
			
		}
		
		function updateParametersFromContext(){
		
			var context = _self.dataContext();

			_self.pageNum(context.pageNum());
			_self.pageSize(context.pageSize());
			_self.hasNextItems(context.hasNextItems());
			_self.hasPrevItems(context.hasPrevItems());
			_self.positionText(context.positionText());
		}

		this.clearFilter = function () {
		    _self.filterPhrase("");
		};

		this.filterPhrase.subscribe(function (newValue) {

		    _self.getPage();

		});

	}).apply(obj, args);
	
	return obj;
};





SW.vm.collections.data.AccessorCollection = function(options){
	SW.factory.dataCollectionsViewModelFactory.dataAccessorCollectionViewModelBase(this, options);
};
SW.vm.collections.data.PagingAccessorCollection = function(options){

	SW.factory.dataCollectionsViewModelFactory.dataAccessorCollectionViewModelBase(this, options);
	SW.factory.dataCollectionsViewModelFactory.dataPagingCollectionViewModelBase(this, options);
};



SW.vm.collections.data.AdminCollection = function(options){

	SW.factory.dataCollectionsViewModelFactory.dataAccessorCollectionViewModelBase(this, options);
	SW.factory.dataCollectionsViewModelFactory.dataAdminCollectionViewModelBase(this, options);
};
SW.vm.collections.data.PagingAdminCollection = function(options){

	SW.factory.dataCollectionsViewModelFactory.dataAccessorCollectionViewModelBase(this, options);
	SW.factory.dataCollectionsViewModelFactory.dataAdminCollectionViewModelBase(this, options);
	SW.factory.dataCollectionsViewModelFactory.dataPagingCollectionViewModelBase(this, options);
};





