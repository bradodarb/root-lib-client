/* Brad Murry*/
;
"use strict";
var SW = SW || {};
SW.vm = SW.vm || {};

//Manages a given object's child property that is a collection with a database association
//Provides association and CRUD operations for the child property type
SW.vm.dataItemManager = function (container, options) {

	SW.vm.ViewModel.call(this, { typeName: "ChildPropertyManager" });

	var _self = this;
	var _isCollection = SW.util.getValueOrDefault(options.isCollection, true);

	var _idleView = options.idleView;
	var _itemView = options.itemView;
	var _dbView = options.dbView;
	var _containerAccessor = options.containerAccessor;

	var _addAssociationUrl = options.addAssociationUrl;
	var _removeAssociationUrl = options.removeAssociationUrl;
	var _clearAssociationsUrl = options.clearAssociationsUrl;

	var onConfigureItem = options.onConfigureItem || null;
	this.container = container;

	this.canAdd = ko.observable(false);
	this.canCopy = ko.observable(false);
	this.canSelectFromDB = ko.observable(false);
	this.canAddNew = ko.observable(true);
	this.canRemove = ko.observable(false);
	this.canSave = ko.observable(false);
	this.canConfigureItem = ko.observable(false);

	this.control = ko.observable({ name: _idleView, data: null });
	this.currentItem = ko.observable(null);
	this.currentDbItem = ko.observable(null);
	this.items = ko.observableArray();

	this.register('context', options.context);



	this.pageNum = ko.observable(options.pageNum || 1);
	this.pageSize = ko.observable(options.pageSize || 10);
	this.sortField = ko.observable(options.sortField || "name");
	this.filterField = ko.observable(options.filterField || "");
	this.filterPhrase = ko.observable(options.filterPhrase || "");
	this.isAscending = ko.observable(options.isAscending || false);

	this.pageCount = ko.observable(options.pageCount || 0);
	this.positionText = ko.observable(options.positionText || "");
	this.hasPrevItems = ko.observable(options.hasPrevItems || false);
	this.hasNextItems = ko.observable(options.hasNextItems || false);


	this.selectItem = function (item) {
		if (_self.currentItem() !== item) {
			_self.currentItem(item);
			setEditMode()
		} else {
			setIdleMode()
		}
	};

	this.selectDbItem = function (item) {
		if (_self.currentDbItem() !== item) {
			_self.currentDbItem(item);
		} else {
			_self.currentDbItem(null);
		}
	};

	this.addItem = ko.asyncCommand({

		execute: function (complete) {

			var itemToAdd = _self.currentDbItem();

			if (itemToAdd) {
				var container = _self.container();
				var parentid = SW.util.propVal(container.id);
				var childid = SW.util.propVal(itemToAdd.id);
				_self.context.exePOST(_addAssociationUrl + parentid + "/" + childid, null, function () {
					if (container) {
						if (_isCollection) {
							var found = false;
							ko.utils.arrayForEach(container[_containerAccessor](), function (vm) {
								if (vm.id() == itemToAdd.id()) {
									found = true;
								}
							});
							if (!found) {
								container[_containerAccessor].push(itemToAdd);
							}
							checkDuplicates();
						} else {
							if (!container[_containerAccessor]) {
								container[_containerAccessor] = ko.observable();
							}
							SW.util.setProp(container[_containerAccessor], itemToAdd);
						}
					}
					complete();
				});
			};
		},
		canExecute: function (isExecuting) {
			return !isExecuting;
		}
	});

	this.copyItem = ko.asyncCommand({

		execute: function (complete) {
			var itemToAdd = _self.currentDbItem() || _self.currentItem();

			if (itemToAdd) {

				var payload = ko.mapping.toJSON(itemToAdd);

				_self.context.create(payload, function (item) {
					var container = _self.container();
					if (container) {

						var parentid = SW.util.propVal(container.id);
						var childid = SW.util.propVal(item.id);
						_self.context.exePOST(_addAssociationUrl + parentid + "/" + childid, null, function () {
							var newItem = ko.mapping.fromJS(item, {});

							if (_isCollection) {
								container[_containerAccessor].push(newItem);

							} else {
								if (!container[_containerAccessor]) {
									container[_containerAccessor] = ko.observable();
								}
								SW.util.setProp(container[_containerAccessor], newItem);
							}
						});

					}
					complete();
				});
			};
		},
		canExecute: function (isExecuting) {
			return !isExecuting;
		}
	});

	this.getItems = ko.asyncCommand({

		execute: function (complete) {


			getPage(complete);

		},
		canExecute: function (isExecuting) {
			return !isExecuting;
		}
	});

	this.previous = ko.asyncCommand({
		execute: function (complete) {

			updateContextParameters();
			_self.context.previous(function (data) {
				updateParametersFromContext();
				ko.mapping.fromJS(data, {}, _self.items);


				checkDuplicates();
				setDbMode();
				complete();
			});

		},
		canExecute: function (isExecuting) {
			return !isExecuting;
		}
	});

	this.next = ko.asyncCommand({
		execute: function (complete) {

			updateContextParameters();
			_self.context.next(function (data) {
				updateParametersFromContext();
				ko.mapping.fromJS(data, {}, _self.items);


				checkDuplicates();
				setDbMode();
				complete();
			});

		},
		canExecute: function (isExecuting) {
			return !isExecuting;
		}
	});


	this.addNewItem = ko.asyncCommand({

		execute: function (complete) {
			_self.context.create(null, function (item) {
				var container = _self.container();
				if (container) {

					var parentid = SW.util.propVal(container.id);
					var childid = SW.util.propVal(item.id);
					_self.context.exePOST(_addAssociationUrl + parentid + "/" + childid, null, function () {

						var newItem = ko.mapping.fromJS(item, {});
						if (_isCollection) {
							container[_containerAccessor].push(newItem);
						} else {
							if (!container[_containerAccessor]) {
								container[_containerAccessor] = ko.observable();
							}
							SW.util.setProp(container[_containerAccessor], newItem);
						}
						_self.currentItem(newItem);
						setEditMode();
						complete();
					});
				}
			});

		},
		canExecute: function (isExecuting) {
			return !isExecuting;
		}
	});

	this.removeItem = ko.asyncCommand({

		execute: function (complete) {
			var container = _self.container();
			if (container) {
				var item = _self.currentItem();
				var parentid = container.id();
				var childid = item.id();

				if (_isCollection) {
					_self.context.exePOST(_removeAssociationUrl + parentid + "/" + childid, null, function () {
						var item = _self.currentItem();
						if (item) {
							container[_containerAccessor].remove(item);
						}
						_self.currentItem(null);
						setIdleMode();
						complete();
					});
				} else {
					_self.context.exePOST(_removeAssociationUrl + parentid, null, function () {
						if (!container[_containerAccessor]) {
							container[_containerAccessor] = ko.observable();
						}
						container[_containerAccessor](null);
						SW.util.setProp(container[_containerAccessor], null);
						setIdleMode();
						complete();
					});
				}
			}
		},
		canExecute: function (isExecuting) {
			return !isExecuting;
		}
	});

	this.saveItem = ko.asyncCommand({

		execute: function (complete) {
			var item = _self.currentItem();
			if (item) {

				var payload = ko.mapping.toJSON(item);
				_self.context.update(payload, function (newitem) {
					SW.util.setProp(item.id, SW.util.propVal(newitem.id));
					setIdleMode();
					complete();
				});
			}
		},
		canExecute: function (isExecuting) {
			return !isExecuting;
		}
	});

	this.configureItem = ko.asyncCommand({

		execute: function (complete) {
			if (onConfigureItem !== null) {
				if (SW.util.isFunction(onConfigureItem)) {
					onConfigureItem();
				}
			}
		},
		canExecute: function (isExecuting) {
			return !isExecuting;
		}
	});

	this.clearFilter = function () {
		_self.filterPhrase("");
	};

	this.filterPhrase.subscribe(function (newValue) {

		getPage();

	});


	function getPage(complete) {
		updateContextParameters();
		_self.context.getPage(function (data) {
			updateParametersFromContext();
			ko.mapping.fromJS(data, {}, _self.items);


			checkDuplicates();
			setDbMode();
			if (SW.util.isFunction(complete)) {
				complete();
			}
		});
	}
	function setEditMode() {
		_self.currentDbItem(null);
		_self.canAdd(false);
		_self.canCopy(true);
		_self.canSelectFromDB(false);
		_self.canAddNew(false);
		_self.canRemove(true);
		_self.canSave(true);
		if (onConfigureItem !== null) {
			_self.canConfigureItem(true);
		} else {
			_self.canConfigureItem(false);
		}
		_self.control({ name: _itemView, data: _self.currentItem(), afterRender: SW.v.transitions.default });
	}
	function setDbMode() {
		_self.currentDbItem(null);
		_self.canAdd(true);
		_self.canCopy(true);
		_self.canSelectFromDB(true);
		_self.canAddNew(true);
		_self.canRemove(false);
		_self.canSave(false);
		_self.canConfigureItem(false);
		_self.control({ name: _dbView, data: _self.items, afterRender: SW.v.transitions.default });
	}
	function setIdleMode() {
		_self.currentItem(null);
		_self.currentDbItem(null);
		_self.canAdd(false);
		_self.canCopy(false);
		_self.canSelectFromDB(true);
		_self.canAddNew(true);
		_self.canRemove(false);
		_self.canSave(false);
		_self.canConfigureItem(false);
		_self.control({ name: _idleView, data: null, afterRender: SW.v.transitions.default });
	}
	function checkDuplicates() {
		if (!_isCollection) {
			return;
		}
		var container = _self.container();

		if (container) {

			var containerItems = ko.utils.arrayMap(container[_containerAccessor](), function (item) {
				return SW.util.propVal(item.id);
			});
			containerItems = containerItems.sort();

			var dbItems = ko.utils.arrayMap(_self.items(), function (item) {
				return SW.util.propVal(item.id);
			});
			dbItems = dbItems.sort();


			var differences = ko.utils.compareArrays(containerItems, dbItems);
			var duplicates = ko.observableArray();

			ko.utils.arrayForEach(differences, function (difference) {
				if (difference.status === 'retained') {
					duplicates.push(difference.value);
				}
			});

			var removals = [];
			ko.utils.arrayForEach(_self.items(), function (item) {
				if (item && duplicates.indexOf(SW.util.propVal(item.id)) > -1) {
					removals.push(item);
				}
			});

			var length = removals.length;
			for (var i = 0; i < length; i++) {
				_self.items.remove(removals[i]);
			}
		}
	}

	function updateContextParameters() {

		_self.context.pageNum(_self.pageNum());
		_self.context.pageSize(_self.pageSize());
		_self.context.sortField(_self.sortField());
		_self.context.filterField(_self.filterField());
		_self.context.filterPhrase(_self.filterPhrase());
		_self.context.isAscending(_self.isAscending());

	}

	function updateParametersFromContext() {

	    _self.pageNum(_self.context.pageNum());
	    _self.pageSize(_self.context.pageSize());
	    _self.hasNextItems(_self.context.hasNextItems());
	    _self.hasPrevItems(_self.context.hasPrevItems());
	    _self.positionText(_self.context.positionText());
	}

	setIdleMode();
};
