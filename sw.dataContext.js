/* Brad Murry*/
;
"use strict";
var SW = SW || {};
SW.factory = SW.factory || {};

SW.factory.dataContextFactory = SW.factory.dataContextFactory || {};
SW.dc = SW.dc || {};




//Factory Methods  (Interface)

/*
	Interface for reading data objects from the server using ajax
	Supports caching using local storage
	
*/
SW.factory.dataContextFactory.accessorContext =  function() {

    var args = arguments;
    var obj = SW.factory.getTarget(args, "AccessorContext");
	
    (function () {

        var _self = this;
        var _options = SW.factory.getOptions(args);

		
        var _getURL = _options.getURL || "";
        var _getManyURL = _options.getManyURL || "";
        var _geAllURL = _options.geAllURL || "";
		
		this.clientSource = _options.clientSource || false;
		this.isLocal = _options.isLocal || false;
		this.isSession = _options.isSession || false;
		this.cache = {};
		this.resetCache = false;

		this.parent = null;
		
		this.dataType = _options.dataType || "json";
		this.contentType = _options.contentType || "application/json";
		
        this.get = function (id, callback) {
			_self.exeGET(_getURL + id, callback,  ': Could not get item! ' + id);
        };

        this.getMany = function (ids, callback) {
			_self.exeGET(_getManyURL + ids, callback, ': Could not get items! ' + ids);
        };
		
		this.getAll = function (callback) {
			_self.exeGET(_geAllURL, callback, ': Could not get all items! ');
        };
		
		this.exeGET = function(key, callback, errorDetail, data){
			
			var localKey = null;
			if(data){
				localkey = JSON.stringify(data);
			}else{
				localkey = key;
			}
			
			var action = function(){
				if(data){
					getFromServerbyPost(key, callback, errorDetail, data);
				}else{
					getFromServer(key, callback, errorDetail);
				}
			};
			if(_self.resetCache === false){
		
				if (_self.clientSource  === true && _self.isLocal === true){
					var item = (isSession === true) ? sessionStorage[localKey] : localStorage[localKey];
					if(item){
						action = function(){
														callback(JSON.parse(item));
													};
					}
				}else	if (_self.clientSource === true){
					var clientItem = _self.cache[localKey];
					if(clientItem){
						action = function(){
													callback(JSON.parse(clientItem));
												};
					}
				}
			}
			action();
		}
		
		function getFromServer(key, callback, errorDetail){
			$.getJSON(key, 
			function (data) {
					if(data){
						updateCache(key, data);
					}
					if (callback != null) {
						callback(data);
					}
				}).error(function (error) {
					if(_self.handleError){
						_self.handleError(errorDetail, error.responseText);
					}
			});
		}
		
		function getFromServerbyPost(key, callback, errorDetail, querydata){
		
			$.ajax({
				type: "POST",
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				url: key,
				data: querydata,
				success: function (data) {
					if(data){
						updateCache(JSON.stringify(querydata), data);
					}
					if (callback != null) {
						callback(data);
					}
				},
				error: function (a, b, c) {
					if(_self.handleError){
						_self.handleError(errorDetail, error.responseText);
					}
				}
			});
		}
		
		function updateCache(key, data){
			_self.resetCache = false;
			if (_self.clientSource  === true && _self.isLocal === true){
				if(isSession === true){
					sessionStorage[key] = data;
				}else{
					localStorage[key] = data;
					}
			}else if(_self.clientSource  === true){
				_self.cache[key] = data;
			}
		
		}
		
		
    }).apply(obj, args);
	
	return obj;
};

/*
	Interface for creating, updating and deleting data objects from the server using ajax
*/
SW.factory.dataContextFactory.adminContext =  function() {

    var args = arguments;
    var obj = SW.factory.getTarget(args, "AdminContext");
    (function () {

        var _self = this;
        var _options = SW.factory.getOptions(args);

		
        var _createURL = _options.createURL || "";
        var _updateURL = _options.updateURL || "";
        var _deleteURL = _options.deleteURL || "";

        var modelStart = _options.modelStart || function () { return null; };
  
        this.create = function (item, callback) {

            var seed = item || modelStart() || {};
            _self.exePOST(_createURL, seed, callback, ': Could not create item!');

        };

        this.update = function (item, callback, validationHandler) {

			 _self.exePUT(_updateURL, item, callback,  ': Could not update item!', validationHandler);

        };

        this.remove = function (item, callback) {
            _self.exeDELETE(_deleteURL + item, callback, ': Could not delete item!');

        };

		
		this.exePOST = function (key, item, callback, errorDetail){
			$.ajax({
						url: key,
						type: "POST",
						data: item,
						dataType: "json",
						contentType: "application/json",
						success: function (result) {
						
							if (callback) {
								callback(result);
							}
						}
						, error: function (error) {
							
							if(_self.handleError){
								_self.handleError(errorDetail, error.responseText);
							}
						}
			});
		};
		
		this.exePUT = function(key, item, callback, errorDetail, validationHandler){
				if(item){
				$.ajax(
				{
				    url: key,
					type: "PUT",
					data: item,
					dataType: "json",
					contentType: "application/json",
					success: function (result) {
						if (callback) {
							callback(result);
						}
					},
					error: function (error) {
						try {
							var payload = JSON.parse(error.responseText);
							if (payload.errors) {
								if(validationHandler){
									var len = payload.errors.length;

									for (var i = 0; i < len; i++) {
										validationHandler.add(payload.errors[i].name, payload.errors[i].errorMessage);
									}
							   }
							} else {
								if(_self.handleError){
									_self.handleError(errorDetail, error.responseText);
								}
							}
						} catch (err) {
							if(_self.handleError){
								_self.handleError(errorDetail, err);
							}
						}
					}
				});
			}
		}
    
		this.exeDELETE = function(key, callback, errorDetail){
			$.ajax({
				url: key,
				type: "DELETE",
				success: function (result) {
				
					if (callback) {
						callback(result);
					}
				},
				error: function (result) {
				
					if(_self.handleError){
						_self.handleError(key, error.responseText);
					}
				}
			});
		};
	
	}).apply(obj, args);
	
	return obj;
};

/*
	Interface for paging, sorting and filtering data
*/
SW.factory.dataContextFactory.pagingContext =  function() {

    var args = arguments;
    var obj = SW.factory.getTarget(args, "PagingContext");
	
	
    (function () {
	
        var _self = this;
        var _options = SW.factory.getOptions(args);
		
		
        var _pageURL = _options.pageURL || "";
		
		var _pageNum = _options.pageNum || 1;
		var _pageSize = _options.pageSize || 10;
		var _sortField = _options.sortField || "";
		var _filterField = _options.filterField || "";
		var _filterPhrase = _options.filterPhrase || "";
		var _isAscending = _options.isAscending || false;

		var _pageCount = _options.pageCount || 0;
		var _positionText = _options.positionText || "";
		var _hasPrevItems = _options.hasPrevItems || false;
		var _hasNextItems = _options.hasNextItems || false;
		
		//Paging options
		this.pageNum = function(){
			if(arguments.length > 0){
				_pageNum = arguments[0];
			}else{
				return _pageNum;
			}
		};
		
		this.pageSize = function(){
			if(arguments.length > 0){
				_pageSize = arguments[0];
			}else{
				return _pageSize;
			}
		};
		
		this.sortField = function(){
			if(arguments.length > 0){
				_sortField = arguments[0];
			}else{
				return _sortField;
			}
		};
		
		this.filterField = function(){
			if(arguments.length > 0){
				_filterField = arguments[0];
			}else{
				return _filterField;
			}
		};
		
		this.filterPhrase = function(){
			if(arguments.length > 0){
				_filterPhrase = arguments[0];
			}else{
				return _filterPhrase;
			}
		};
        
		this.isAscending = function(){
			if(arguments.length > 0){
				_isAscending = arguments[0];
			}else{
				return _isAscending;
			}
		};
       	
		
		//Read only items for pagination
		this.pageCount = function(){
			return _pageCount;
		};
		
		this.positionText = function(){
			return _positionText;
		};
		
		this.hasPrevItems = function(){
			return _hasPrevItems;
		};
		
		this.hasNextItems = function(){
			return _hasNextItems;
		};
		
		
		//Paging methods
		this.next = function(callback){
		
			if(_hasNextItems === true){
				_pageNum = _pageNum + 1;
				_self.getPage(callback);
			}
		};
		
		this.previous = function(callback){
		
			if(_hasPrevItems === true){
				_pageNum = _pageNum - 1;
				_self.getPage(callback);
			}
		};
		
		this.pageByNumber = function(pagenum, callback){
				_pageNum = pagenum;
				_self.getPage(callback);
		}
		
        this.getPage = function (callback) {
		
			if(_self.clientSource !== true){
				getServerPage(callback);
			}else{
				getClientPage(callback);
			}
        };

		this.refreshClientSouce = function(callback){
			_self.exeGet(_pageURL, callback, ': Could not get client page source! ');
		}
		
		function getServerPage(callback){
		
		    _self.exeGET(_pageURL + _pageSize + "/" + _pageNum + "/" + _sortField + "/" + _isAscending + "/" + _filterPhrase,
			function(data){
			
				_pageCount = data.count;
                _positionText = data.caption;
                _hasPrevItems = data.prev;
                _hasNextItems = data.next;
				
				if (callback) {
					callback(data.items);
				}
			}, "Unable to retrieve page# " + _pageNum);
		}
		
		function getClientPage(callback){
			
			var source = getClientSource();
			
			if(source !== null){
				_pageCount = Math.ceil(source / _pageSize);
				_positionText = _pageNum + " of " + _pageCount;
				_hasPrevItems = _pageNum > 1;
				_hasNextItems = _pageNum < _pageCount;

				var startIndex = (_pageNum - 1)  * _pageSize;
				var results = source.slice(startIndex, startIndex + _pageSize);

				if (callback) {
					callback(results);
				}
			}
		}
		
		function getClientSource(key){
			
			var result = null;
			if (_self.clientSource === true && _self.isLocal === true){
				if(isSession === true){
					if(sessionStorage[key]){
						result = sessionStorage[key];
					}
				}else if(_self.clientSource === true){
					if(_self.cache[key]){
						result = cache[key];
					}
				}else{
					if(localStorage[key]){
						result = localStorage[key];
					}
				}
			}

			
			
			//Filter
			if(result.length > 0 && _filterPhrase){
				if(result[0][_filterField]){
					var filter = _filterPhrase.toLowerCase();
					result = result.filter(function(element, index, array){
													var target = element[_filterField].toLowerCase();
													return (filter.indexOf(target) !== -1);
					});
				}
			}
			//Sort
			if(result.length > 0 && _sortField){
				if(result[0][_sortField]){
					if(_isAcending){
						result = result.sort(function(a, b){
														if (a[_sortField] > b[_sortField]) return 1;
														if (a[_sortField] < b[_sortField]) return -1;
														return 0;		
						});															
					}else{
						result = result.sort(function(a, b){
														if (a[_sortField] > b[_sortField]) return -1;
														if (a[_sortField] < b[_sortField]) return 1;
														return 0;
						});
					}
				}
			}
			return result;
		}
		
    }).apply(obj, args);
	
	return obj;
};




//Module Objects

/*
	Ctor for data context manager
 */
SW.dc.DataContextManager = function(options){
	
	var _self = this;
	
	SW.factory.collections.iCollection(this, options);
	
	this.parent = null;
		
	this.messageService = options.messageService || null;
	
	this.register = function(contextName, context){
		if(_self.messageService){
			var messenger = _self.messageService;
			context.handleError = function(title, message){
				messenger.handleError(title, message);
			};
		}
		context.parent = this;
		this.add(contextName, context);
	};
};

/*
	Ctor for accessor data context
*/
SW.dc.AccessorContext = function(options){
	SW.factory.dataContextFactory.accessorContext(this, options);
}

/*
	Ctor for admin data context
*/
SW.dc.AdminContext = function(options){
	SW.factory.dataContextFactory.accessorContext(this, options);
	SW.factory.dataContextFactory.adminContext(this, options);
}

/*
	Ctor for paging accessor data context
*/
SW.dc.PagingAccessorContext = function(options){
	SW.factory.dataContextFactory.accessorContext(this, options);
	SW.factory.dataContextFactory.pagingContext(this, options);
}

/*
	Ctor for paging admin data context
*/
SW.dc.PagingAdminContext = function(options){
	SW.factory.dataContextFactory.accessorContext(this, options);
	SW.factory.dataContextFactory.adminContext(this, options);
	SW.factory.dataContextFactory.pagingContext(this, options);
}
