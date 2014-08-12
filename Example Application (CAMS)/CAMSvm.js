//#region Define Viewmodels

//#region Sites
SW.siteAdmin = function () {

    //Inherit from ViewModelBase
    var _self = this;
    SW.vm.ViewModel.call(this, { typeName: "SiteAdmin" });

    this.register('siteList', new SW.siteCollection());
    this.register('userList', new SW.userCollection());
    this.register('siteRoleManager', new SW.siteRoleManager());

    this.showDetailCommands = ko.observable(false);
    
    this.register('areaManager', new SW.vm.dataItemManager(_self.siteList.collection.currentItem, {
        containerAccessor: 'childAreas'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/areas/get/"
        , getManyURL: "/api/areas/many/"
        , geAllURL: "/api/areas/all/"
        , createURL: "/api/areas/new/"
        , updateURL: "/api/areas/update/"
        , deleteURL: "/api/areas/delete/"
        , pageURL: "/api/areas/page/"
        })
    , idleView: 'areachildareaidle'
    , itemView: 'areachildareaitem'
    , dbView: 'areachildarealist'

    , addAssociationUrl: "/api/sites/AddAreaToSite/"
    , removeAssociationUrl: "/api/sites/RemoveAreaFromSite/"
    , onConfigureItem: configureArea
        }));

    this.register('documentManager', new SW.vm.dataItemManager(_self.siteList.collection.currentItem, {
        containerAccessor: 'childDocuments'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/documents/get/"
        , getManyURL: "/api/documents/many/"
        , geAllURL: "/api/documents/all/"
        , createURL: "/api/documents/new/"
        , updateURL: "/api/documents/update/"
        , deleteURL: "/api/documents/delete/"
        , pageURL: "/api/documents/page/"
        })
    , idleView: 'areadocidle'
    , itemView: 'areadocitem'
    , dbView: 'areadoclist'

    , addAssociationUrl: "/api/sites/AddDocumentToSite/"
    , removeAssociationUrl: "/api/sites/RemoveDocumentFromSite/"
    , onConfigureItem: configureDocument
    }));

    this.siteList.collection.onSelected = function (item) {

        //_self.areaManager.container = item;
        //_self.documentManager.container = item;

        SW.sess.item('siteManager').setRootVM(item);
        _self.showDetailCommands(true);

        _self.userList.getAll();
    };
    this.siteList.collection.onDeselected = function () {
        var item = SW.sess.item('siteManager').data('siteAdmin').siteList;

        SW.sess.item('siteManager').setRootVM(item);
        _self.showDetailCommands(false);
        _self.userList.collection.deselect();
    };
    this.siteList.onRemoved = function () {
        this.collection.deselect();
    };
    this.siteList.onUpdated = function () {
        this.collection.deselect();
    };
    this.siteList.onCreated = function (item) {
        this.collection.select(item);
    };

    this.userList.collection.onSelected = function (item) {
        
        initSiteRoles();

    };


    this.createSite = ko.asyncCommand({

        execute: function (complete) {
            _self.siteList.create(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });


    this.updateSite = ko.asyncCommand({

        execute: function (complete) {
            _self.siteList.update(complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.removeSite = ko.asyncCommand({

        execute: function (complete) {
            _self.siteList.remove(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.addUserToSite = ko.asyncCommand({

        execute: function (complete) {

            var user = _self.userList.collection.currentItem();
            var site = _self.siteList.collection.currentItem();
            if (site && user) {
                _self.siteRoleManager.addUserToSite(site, user, complete);
            }
        },
        canExecute: function (isExecuting) {

            return !isExecuting;
        }
    });
    this.removeUserFromSite = ko.asyncCommand({

        execute: function (complete) {

            var user = _self.userList.collection.currentItem();
            var site = _self.siteList.collection.currentItem();
            if (site && user) {
                _self.siteRoleManager.removeUserFromSite(site, user, complete);
            }
        },
        canExecute: function (isExecuting) {
           
            return !isExecuting;
        }
    });
    this.updateSiteRole = ko.asyncCommand({

        execute: function (complete) {
            _self.siteRoleManager.updateSiteRole(complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });
    this.editSiteStructure = ko.asyncCommand({

        execute: function (complete) {
            var site = _self.siteList.collection.currentItem();
            if (site) {
                window.location = "/CAMS/admin/sitestructure/" + site.id();
            }
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });
 

    function initSiteRoles() {
        _self.siteRoleManager.siteRoleList.collection.currentItem(null);

        var user = _self.userList.collection.currentItem();
        var site = _self.siteList.collection.currentItem();

        if (site && user) {
            _self.siteRoleManager.resolveSiteRoles(site, user);
        }
    }

    function configureArea() {
        var item = SW.util.propVal(_self.areaManager.currentItem);
        if (item) {
            window.location = "/CAMS/admin/editarea/" + SW.util.propVal(item.id);
        }
    }
    function configureDocument() {
        var item = SW.util.propVal(_self.documentManager.currentItem);
        if (item) {
            window.location = "/CAMS/admin/editdocument/" + SW.util.propVal(item.id);
        }
    }
};
SW.siteCollection = function () {

    var siteContext = new SW.dc.PagingAdminContext({
        getURL: "/api/sites/get/"
        , getManyURL: "/api/sites/many/"
        , geAllURL: "/api/sites/all/"
        , createURL: "/api/sites/new/"
        , updateURL: "/api/sites/update/"
        , deleteURL: "/api/sites/delete/"
        , pageURL: "/api/sites/page/"
    });

    SW.vm.ViewModel.call(this, { typeName: "SiteCollection" });

    SW.vm.collections.data.PagingAdminCollection.call(this, {
        dataContext: siteContext, sortField: "name",
        collection: new SW.vm.collections.viewModelSelectableCollectionBase(),
        onCreate: function (item) {

            SW.vm.ViewModel.call(item, { typeName: "Site" });

            if (!item.childAreas) {
                item.childAreas = ko.observableArray();
            }
            if (!item.childDocuments) {
                item.childDocuments = ko.observableArray();
            }
        }
    });

};


SW.siteStructureAdmin = function () {

    //Inherit from ViewModelBase
    var _self = this;
    SW.vm.ViewModel.call(this, { typeName: "SiteStructureAdmin" });
    this.site = ko.observable(null);
    this.currentNode = ko.observable(null);

    this.canAddItem = ko.observable(false);
    this.canRemoveItem = ko.observable(false);

    this.register('siteStructureContext', new SW.dc.AdminContext({
        getURL: "/api/sitestructure/get/"
        , getManyURL: "/api/sitestructure/many/"
        , geAllURL: "/api/sitestructure/all/"
        , createURL: "/api/sitestructure/new/"
        , updateURL: "/api/sitestructure/update/"
        , deleteURL: "/api/sitestructure/delete/"
    }));

    this.register('documentContext', new SW.dc.AdminContext({
        getURL: "/api/documents/get/"
     , getManyURL: "/api/documents/many/"
     , geAllURL: "/api/documents/all/"
     , createURL: "/api/documents/new/"
     , updateURL: "/api/documents/update/"
     , deleteURL: "/api/documents/delete/"
    }));

    this.register('areaContext', new SW.dc.AdminContext({
        getURL: "/api/areas/get/"
     , getManyURL: "/api/areas/many/"
     , geAllURL: "/api/areas/all/"
     , createURL: "/api/areas/new/"
     , updateURL: "/api/areas/update/"
     , deleteURL: "/api/areas/delete/"
    }));

    this.createArea = ko.asyncCommand({

        execute: function (complete) {

            var container = _self.currentNode();
            
            if (container && isContainer(container)) {
                var area = getNewArea();
                area.container = function () { return container.areas };
                container.areas.push(area);
                saveSite(complete);
                //_self.areaContext.create(null, function (item) {
                //    var area = ko.mapping.fromJS(item, {});
                //    area.container = function () { return container.areas };
                //    container.areas.push(area);
                //    saveSite(complete);
                //});
            }
        },
        canExecute: function (isExecuting) {

            return !isExecuting;
        }
    });

    this.createDocument = ko.asyncCommand({

        execute: function (complete) {
            var container = _self.currentNode();
            
            if (container && isContainer(container)) {
                var document = getNewDocument();
                document.container = function () { return container.documents };

                container.documents.push(document);

                saveSite(complete);
            }
        },
        canExecute: function (isExecuting) {
            
            return !isExecuting;
        }
    });

    this.removeItem = ko.asyncCommand({

        execute: function (complete) {

            var node = _self.currentNode();
            if (node) {
                node.container().remove(node);
                _self.currentNode(null);
            }
            saveSite(complete);
        },
        canExecute: function (isExecuting) {
           
            return !isExecuting;
        }
    });

    this.saveSiteStructure = ko.asyncCommand({

        execute: function (complete) {

            saveSite(complete);
        },
        canExecute: function (isExecuting) {

            return !isExecuting;
        }
    });

 

    this.getSiteStructure = function (id, complete) {
        _self.siteStructureContext.get(id, function (data) {

            var item = ko.mapping.fromJS(data, {});

            SW.vm.ViewModel.call(item, { typeName: "SiteStructure" });

            implementAreas(item.areas);
            implementDocuments(item.documents);

            _self.site(item);
            if (SW.util.isFunction(complete)) {
                complete();

                _self.selectNode(null);
            }
        });
    };

    this.selectNode = function (item) {
        _self.currentNode(item);
        if (item) {
            _self.canRemoveItem(true);
            if (isContainer(item)) {
                _self.canAddItem(true);
            } else {
                _self.canAddItem(false);
            }
        } else {
            _self.canAddItem(false);
            _self.canRemoveItem(false);
        }
        return false;
    };

    this.editNode = function () {
        var item = _self.currentNode();
        var id = SW.util.propVal(item.id);
        if (item) {
            switch (item.typeName()) {
                case "SiteStructure":
                    window.location = "/CAMS/admin/sitemanager";
                    break;
                case "Area":
                    window.location = "/CAMS/admin/editarea/" + id;
                    break;
                case "Document":
                    window.location = "/CAMS/admin/editdocument/" + id;
                    break;
                default:
                    window.location = window.location.href;
                    break;
            }
        }
    };

    function saveSite(complete) {
        var site = ko.mapping.toJSON(_self.site());


        _self.siteStructureContext.update(site, function () {

            _self.getSiteStructure(_self.site().id(), complete);

        });
    }

    function implementAreas(areas) {
        
        ko.utils.arrayForEach(areas(), function (vm) {
            SW.vm.ViewModel.call(vm, { typeName: "Area" });
            vm.container = function () { return areas; };
            if (!vm.areas) {
                vm.areas = ko.observableArray();
            } else {
                implementAreas(vm.areas);
            }
            if (!vm.documents) {
                vm.documents = ko.observableArray();
            } else {
                implementDocuments(vm.documents);
            }
        });
    }
    function implementDocuments(docs) {
        ko.utils.arrayForEach(docs(), function (vm) {
            SW.vm.ViewModel.call(vm, { typeName: "Document" });
            vm.container = function () { return docs; };
        });
    }

    function getNewArea() {

        var result = {};
        SW.vm.ViewModel.call(result, { typeName: "Area" });
        result.id = ko.observable(0);
        result.name = ko.observable("New Area");
        result.areas = ko.observableArray();
        result.documents = ko.observableArray();

        return result;
    }

    function getNewDocument() {

        var result = {};
        SW.vm.ViewModel.call(result, { typeName: "Document" });
        result.id = ko.observable(0);
        result.name = ko.observable("New Document");

        return result;
    }

    function isContainer(item) {
        var name = item.typeName();
        if (name === "Area" || name === "SiteStructure") {
            return true;
        }
        return false;
    }
};
SW.siteStructureCollection = function () {

    var siteContext = new SW.dc.AdminContext({
        getURL: "/api/sitestructure/get/"
        , getManyURL: "/api/sitestructure/many/"
        , geAllURL: "/api/sitestructure/all/"
        , createURL: "/api/sitestructure/new/"
        , updateURL: "/api/sitestructure/update/"
        , deleteURL: "/api/sitestructure/delete/"
    });

    SW.vm.ViewModel.call(this, { typeName: "SiteStructureCollection" });

    SW.vm.collections.data.AdminCollection.call(this, {
        dataContext: siteContext, sortField: "name",
        collection: new SW.vm.collections.viewModelSelectableCollectionBase(),
        onCreate: function (item) {

            SW.vm.ViewModel.call(item, { typeName: "SiteStructure" });
            if (!item.areas) {
                item.areas = ko.observableArray();
            } else {
                ko.utils.arrayForEach(item.areas(), function (vm) {
                    SW.vm.ViewModel.call(vm, { typeName: "Area" });
                });
            }
            if (!item.documents) {
                item.documents = ko.observableArray();
            } else {
                ko.utils.arrayForEach(item.documents(), function (vm) {
                    SW.vm.ViewModel.call(vm, { typeName: "Document" });
                });
            }
        }
    });

};
//#endregion

//#region Site Roles
SW.siteRoleManager = function () {

    SW.vm.ViewModel.call(this, { typeName: "SiteRoleManager" });
    _self = this;


    this.register('siteRoleList', new SW.siteRoleCollection());

    this.canAddUserToSite = ko.observable(false);
    this.canRemoveUserFromSite = ko.observable(false);


    this.resolveSiteRoles = function (site, user, complete) {
        _self.siteRoleList.getSiteRolesBySite(site.id(), function () {
            var siteContainsUser = ko.utils.arrayFirst(_self.siteRoleList.collection.items(), function (item) {
                if (user.id() === item.user.id()) {
                    _self.siteRoleList.collection.currentItem(item);
                    return true;
                }
            });

            _self.canAddUserToSite(!siteContainsUser);
            _self.canRemoveUserFromSite(siteContainsUser);
            if (complete) {
                complete();
            }
        });
    };
    this.addUserToSite = function (siteToAdd, userToAdd, complete) {

        if (siteToAdd && userToAdd) {
            var seed = ko.mapping.toJSON({
                 
                    site: siteToAdd
                   , user: userToAdd
                
            });
            _self.siteRoleList.create(seed, function (item) {
                _self.canAddUserToSite(false);
                _self.canRemoveUserFromSite(true);
                _self.siteRoleList.collection.currentItem(item);
                if (complete) {
                    complete();
                }
            });
        }

    };
    this.removeUserFromSite = function (site, user, complete) {
        if (site && user) {

            var siteRole = ko.utils.arrayFirst(_self.siteRoleList.collection.items(), function (item) {
                if (user.id() === item.user.id()) {
                    return item;
                }
            });

            if (siteRole) {
                _self.siteRoleList.remove(siteRole, function () {
                    _self.canAddUserToSite(true);
                    _self.canRemoveUserFromSite(false); 
                    _self.siteRoleList.collection.currentItem(null);
                    if (complete) {
                        complete();
                    }
                });
            } else {
                _self.canAddUserToSite(false);
                _self.canRemoveUserFromSite(true);
            }
        }
    };

    this.updateSiteRole = function(complete){
        var siteRole = _self.siteRoleList.collection.currentItem();
        if (siteRole) {
            _self.siteRoleList.update(complete);
        }
    };
};

SW.siteRoleCollection = function () {
    var _self = this;
    var siteContext = new SW.dc.PagingAdminContext({
        getURL: "/api/siteroles/get/"
        , getManyURL: "/api/siteroles/many/"
        , geAllURL: "/api/siteroles/all/"
        , createURL: "/api/siteroles/new/"
        , updateURL: "/api/siteroles/update/"
        , deleteURL: "/api/siteroles/delete/"
        , pageURL: "/api/siteroles/page/"
    });

    SW.vm.ViewModel.call(this, { typeName: "UserRoleCollection" });

    SW.vm.collections.data.PagingAdminCollection.call(this, {
        dataContext: siteContext, sortField: "name",
        collection: new SW.vm.collections.viewModelSelectableCollectionBase(),
        onCreate: function (item) {

            SW.vm.ViewModel.call(item, { typeName: "SiteRole" });
        }
    });

    this.getSiteRolesBySite = function (siteId, callback) {

        _self.getManyFrom("/api/siteroles/getbysite/" + siteId, callback);

    };
}
//#endregion

//#region Users
SW.userAdmin = function () {

    //Inherit from ViewModelBase
    SW.vm.ViewModel.call(this, { typeName: "UserAdmin" });

    this.register('userList', new SW.siteCollection());


    this.showDetailCommands = ko.observable(false);

    var _self = this;

    this.userList.collection.onSelected = function (item) {
        SW.sess.item('userManager').setRootVM(item);
        _self.showDetailCommands(true);
    };

    this.userList.collection.onDeselected = function () {
        var item = SW.sess.item('userManager').data('userAdmin').userList;
        SW.sess.item('userManager').setRootVM(item);
        _self.showDetailCommands(false);
    };
    this.userList.onRemoved = function () {
        this.collection.deselect();
    };
    this.userList.onUpdated = function () {
        this.collection.deselect();
    };
    this.userList.onCreated = function (item) {
        this.collection.select(item);
    };
};
SW.userCollection = function () {

    var siteContext = new SW.dc.PagingAdminContext({
        getURL: "/api/users/get/"
        , getManyURL: "/api/users/many/"
        , geAllURL: "/api/users/all/"
        , createURL: "/api/users/new/"
        , updateURL: "/api/users/update/"
        , deleteURL: "/api/users/delete/"
        , pageURL: "/api/users/page/"
    });

    SW.vm.ViewModel.call(this, { typeName: "UserCollection" });

    SW.vm.collections.data.PagingAdminCollection.call(this, {
        dataContext: siteContext, sortField: "name",
        collection: new SW.vm.collections.viewModelSelectableCollectionBase(),
        onCreate: function (item) {

            SW.vm.ViewModel.call(item, { typeName: "User" });
        }
    });

}
//#endregion




//#region Areas

SW.areaAdmin = function () {

    //Inherit from ViewModelBase
    var _self = this;
    SW.vm.ViewModel.call(this, { typeName: "AreaAdmin" });

    this.register('areaList', new SW.areaCollection());

    this.showDetailCommands = ko.observable(false);


    this.areaList.collection.onSelected = function (item) {

        SW.sess.item('AreaManager').setRootVM(item);
        _self.showDetailCommands(true);

    };
    this.areaList.collection.onDeselected = function () {
        var item = SW.sess.item('AreaManager').data('areaAdmin').areaList;

        SW.sess.item('AreaManager').setRootVM(item);
        _self.showDetailCommands(false);

    };
    this.areaList.onRemoved = function () {
        this.collection.deselect();
    };
    this.areaList.onUpdated = function () {
        this.collection.deselect();
    };
    this.areaList.onCreated = function (item) {
        this.collection.select(item);
    };


    this.createArea = ko.asyncCommand({

        execute: function (complete) {
            _self.areaList.create(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.removeArea = ko.asyncCommand({

        execute: function (complete) {
            _self.areaList.remove(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });


    this.editArea = ko.asyncCommand({

        execute: function (complete) {

            var item = SW.util.propVal(_self.areaList.collection.currentItem);
            if (item) {
                window.location = "/CAMS/admin/editarea/" + SW.util.propVal(item.id);
            }
            complete();
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.select = function (item) {
        if (_self.areaList.collection.currentItem() === item) {
            _self.areaList.collection.deselect();
        } else {
            _self.areaList.collection.select(item);
        }
    };
};

SW.areaEditor = function () {

    SW.vm.ViewModel.call(this, { typeName: "AreaEditor" });

    var _self = this;
    this.area = ko.observable(null);

    this.register('areaContext', new SW.dc.AdminContext({
        getURL: "/api/areas/get/"
        , getManyURL: "/api/areas/many/"
        , geAllURL: "/api/areas/all/"
        , createURL: "/api/areas/new/"
        , updateURL: "/api/areas/update/"
        , deleteURL: "/api/areas/delete/"
    }));

    this.register('areaManager', new SW.vm.dataItemManager(_self.area, {
        containerAccessor: 'childAreas'
        , context: new SW.dc.PagingAdminContext({
        getURL: "/api/areas/get/"
        , getManyURL: "/api/areas/many/"
        , geAllURL: "/api/areas/all/"
        , createURL: "/api/areas/new/"
        , updateURL: "/api/areas/update/"
        , deleteURL: "/api/areas/delete/"
        , pageURL: "/api/areas/page/"
    })
    , idleView: 'areachildareaidle'
    , itemView: 'areachildareaitem'
    , dbView: 'areachildarealist'

    , addAssociationUrl: "/api/areas/AddAreaToArea/"
    , removeAssociationUrl: "/api/areas/RemoveAreaFromArea/"
    , onConfigureItem: configureArea
    }));

    this.register('documentManager', new SW.vm.dataItemManager(_self.area, {
        containerAccessor: 'documents'
        , context: new SW.dc.PagingAdminContext({
        getURL: "/api/documents/get/"
        , getManyURL: "/api/documents/many/"
        , geAllURL: "/api/documents/all/"
        , createURL: "/api/documents/new/"
        , updateURL: "/api/documents/update/"
        , deleteURL: "/api/documents/delete/"
        , pageURL: "/api/documents/page/"
    })
    , idleView: 'areadocidle'
    , itemView: 'areadocitem'
    , dbView: 'areadoclist'

    , addAssociationUrl: "/api/areas/AddDocumentToArea/"
    , removeAssociationUrl: "/api/areas/RemoveDocumentFromArea/"
    , onConfigureItem: configureDocument
    }));


    this.updateArea = ko.asyncCommand({

        execute: function (complete) {
            var area = ko.mapping.toJSON(_self.area());


            _self.areaContext.update(area, function () {

                if (SW.util.isFunction(complete)) {
                    complete();
                }

            });
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.getArea = function (id, complete) {

        _self.areaContext.get(id, function (data) {

            var item = ko.mapping.fromJS(data, {});

            SW.vm.ViewModel.call(item, { typeName: "Area" });

            if (!item.childAreas) {
                item.childAreas = ko.observableArray();
            }
            if (!item.documents) {
                item.documents = ko.observableArray();
            }
            _self.area(item);

            if (SW.util.isFunction(complete)) {
                complete();
            }
        });
    };

    this.returnToSite = ko.asyncCommand({

        execute: function (complete) {

            var url = SW.sess.deQueueLocation();

            if (SW.util.wasSameDomain(url)) {
                window.location = url;
            } else {
                var area = _self.area();
                if (area != null) {

                    window.location = "/CAMS/admin/sitestructure/" + area.siteId();
                }
            }
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });


    function configureArea() {
        var item = SW.util.propVal(_self.areaManager.currentItem);
        if (item) {
            window.location = "/CAMS/admin/editarea/" + SW.util.propVal(item.id);
        }
    }
    function configureDocument() {
        var item = SW.util.propVal(_self.documentManager.currentItem);
        if (item) {
            window.location = "/CAMS/admin/editdocument/" + SW.util.propVal(item.id);
        }
    }
};

SW.areaCollection = function () {

    var areaContext = new SW.dc.PagingAdminContext({
        getURL: "/api/areas/get/"
        , getManyURL: "/api/areas/many/"
        , geAllURL: "/api/areas/all/"
        , createURL: "/api/areas/new/"
        , updateURL: "/api/areas/update/"
        , deleteURL: "/api/areas/delete/"
        , pageURL: "/api/areas/page/"
    });

    SW.vm.ViewModel.call(this, { typeName: "AreaCollection" });

    SW.vm.collections.data.PagingAdminCollection.call(this, {
        dataContext: areaContext, sortField: "name",
        collection: new SW.vm.collections.viewModelSelectableCollectionBase(),
        onCreate: function (item) {

            SW.vm.ViewModel.call(item, { typeName: "Area" });
        }
    });

};

//#endregion

//#region Documents
SW.documentAdmin = function () {

    //Inherit from ViewModelBase
    var _self = this;
    SW.vm.ViewModel.call(this, { typeName: "DocumentAdmin" });

    this.register('documentList', new SW.documentCollection());

    this.showDetailCommands = ko.observable(false);


    this.documentList.collection.onSelected = function (item) {

        SW.sess.item('DocumentManager').setRootVM(item);
        _self.showDetailCommands(true);

    };
    this.documentList.collection.onDeselected = function () {
        var item = SW.sess.item('DocumentManager').data('documentAdmin').documentList;

        SW.sess.item('DocumentManager').setRootVM(item);
        _self.showDetailCommands(false);

    };
    this.documentList.onRemoved = function () {
        this.collection.deselect();
    };
    this.documentList.onUpdated = function () {
        this.collection.deselect();
    };
    this.documentList.onCreated = function (item) {
        this.collection.select(item);
    };


    this.createDocument = ko.asyncCommand({

        execute: function (complete) {
            _self.documentList.create(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.removeDocument = ko.asyncCommand({

        execute: function (complete) {
            _self.documentList.remove(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });


    this.editDocument = ko.asyncCommand({

        execute: function (complete) {

            var item = SW.util.propVal(_self.documentList.collection.currentItem);
            if (item) {
                window.location = "/CAMS/admin/editdocument/" + SW.util.propVal(item.id);
            }
            complete();
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.select = function (item) {
        if (_self.documentList.collection.currentItem() === item) {
            _self.documentList.collection.deselect();
        } else {
            _self.documentList.collection.select(item);
        }
    };
};

SW.documentEditor = function () {

    SW.vm.ViewModel.call(this, { typeName: "DocumentEditor" });

    var _self = this;
    var _applyTemplateUrl = "/api/documents/applytemplate";

    this.document = ko.observable(null);
    this.themes = ko.observableArray();

    this.register('documentContext', new SW.dc.AdminContext({
        getURL: "/api/documents/get/"
        , getManyURL: "/api/documents/many/"
        , geAllURL: "/api/documents/all/"
        , createURL: "/api/documents/new/"
        , updateURL: "/api/documents/update/"
        , deleteURL: "/api/documents/delete/"
    }));

    this.register('headerManager', new SW.vm.dataItemManager(_self.document, {
        containerAccessor: 'responseHeaders'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/headers/get/"
            , getManyURL: "/api/headers/many/"
            , geAllURL: "/api/headers/all/"
            , createURL: "/api/headers/new/"
            , updateURL: "/api/headers/update/"
            , deleteURL: "/api/headers/delete/"
            , pageURL: "/api/headers/page/"
        })
        , idleView: 'docheaderidle'
        , itemView: 'docheaderitem'
        , dbView: 'docheaderlist'

        , addAssociationUrl: "/api/documents/AddHeaderToDocument/"
        , removeAssociationUrl: "/api/documents/RemoveHeaderFromDocument/"
    }));

    this.register('includeManager', new SW.vm.dataItemManager(_self.document, {
        containerAccessor: 'includes'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/includes/get/"
            , getManyURL: "/api/includes/many/"
            , geAllURL: "/api/includes/all/"
            , createURL: "/api/includes/new/"
            , updateURL: "/api/includes/update/"
        , deleteURL: "/api/includes/delete/"
            , pageURL: "/api/includes/page/"
        })
        , idleView: 'docincludeidle'
        , itemView: 'docincludeitem'
        , dbView: 'docincludelist'

        , addAssociationUrl: "/api/documents/AddIncludeToDocument/"
        , removeAssociationUrl: "/api/documents/RemoveIncludeFromDocument/"
    }));

    this.register('parameterManager', new SW.vm.dataItemManager(_self.document, {
        containerAccessor: 'parameters'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/parameters/get/"
            , getManyURL: "/api/parameters/many/"
            , geAllURL: "/api/parameters/all/"
            , createURL: "/api/parameters/new/"
            , updateURL: "/api/parameters/update/"
            , deleteURL: "/api/parameters/delete/"
            , pageURL: "/api/parameters/page/"
        })
        , idleView: 'docparameteridle'
        , itemView: 'docparameteritem'
        , dbView: 'docparameterlist'

        , addAssociationUrl: "/api/documents/AddParameterToDocument/"
        , removeAssociationUrl: "/api/documents/RemoveParameterFromDocument/"
        , onConfigureItem: configureParameter
    }));

    this.register('sectionManager', new SW.vm.dataItemManager(_self.document, {
        containerAccessor: 'sections'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/sections/get/"
            , getManyURL: "/api/sections/many/"
            , geAllURL: "/api/sections/all/"
            , createURL: "/api/sections/new/"
            , updateURL: "/api/sections/update/"
            , deleteURL: "/api/sections/delete/"
            , pageURL: "/api/sections/page/"
        })
        , idleView: 'docsectionidle'
        , itemView: 'docsectionitem'
        , dbView: 'docsectionlist'

        , addAssociationUrl: "/api/documents/AddSectionToDocument/"
        , removeAssociationUrl: "/api/documents/RemoveSectionFromDocument/"
        , onConfigureItem: configureSection
    }));

    this.register('tagGroupManager', new SW.vm.dataItemManager(_self.document, {
        containerAccessor: 'tagGroups'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/taggroups/get/"
            , getManyURL: "/api/taggroups/many/"
            , geAllURL: "/api/taggroups/all/"
            , createURL: "/api/taggroups/new/"
            , updateURL: "/api/taggroups/update/"
            , deleteURL: "/api/taggroups/delete/"
            , pageURL: "/api/taggroups/page/"
        })
        , idleView: 'doctaggroupidle'
        , itemView: 'doctaggroupitem'
        , dbView: 'doctaggrouplist'

        , addAssociationUrl: "/api/documents/AddTagGroupToDocument/"
        , removeAssociationUrl: "/api/documents/RemoveTagGroupFromDocument/"
    }));

    this.register('tagManager', new SW.vm.dataItemManager(_self.document, {
        containerAccessor: 'tags'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/tags/get/"
            , getManyURL: "/api/tags/many/"
            , geAllURL: "/api/tags/all/"
            , createURL: "/api/tags/new/"
            , updateURL: "/api/tags/update/"
            , deleteURL: "/api/tags/delete/"
            , pageURL: "/api/tags/page/"
        })
        , idleView: 'doctagidle'
        , itemView: 'doctagitem'
        , dbView: 'doctaglist'

        , addAssociationUrl: "/api/documents/AddTagToDocument/"
        , removeAssociationUrl: "/api/documents/RemoveTagFromDocument/"
    }));

    this.register('routeManager', new SW.vm.dataItemManager(_self.document, {
        containerAccessor: 'rewrites'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/routerewrites/get/"
            , getManyURL: "/api/routerewrites/many/"
            , geAllURL: "/api/routerewrites/all/"
            , createURL: "/api/routerewrites/new/"
            , updateURL: "/api/routerewrites/update/"
            , deleteURL: "/api/routerewrites/delete/"
            , pageURL: "/api/routerewrites/page/"
        })
        , idleView: 'docrouteidle'
        , itemView: 'docrouteitem'
        , dbView: 'docroutelist'

        , addAssociationUrl: "/api/documents/AddRouteRewriteToDocument/"
        , removeAssociationUrl: "/api/documents/RemoveRouteRewriteFromDocument/"
    }));

    this.register('scriptManager', new SW.vm.dataItemManager(_self.document, {
        containerAccessor: 'scripts'
        , isCollection: false
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/documentscripts/get/"
            , getManyURL: "/api/documentscripts/many/"
            , geAllURL: "/api/documentscripts/all/"
            , createURL: "/api/documentscripts/new/"
            , updateURL: "/api/documentscripts/update/"
            , deleteURL: "/api/documentscripts/delete/"
            , pageURL: "/api/documentscripts/page/"
        })
        , idleView: 'docscriptidle'
        , itemView: 'docscriptitem'
        , dbView: 'docscriptlist'

        , addAssociationUrl: "/api/documents/SetDocumentScripts/"
        , removeAssociationUrl: "/api/documents/ClearDocumentScripts/"
        , onConfigureItem: configureScripts
    }));

    this.register('objectManager', new SW.vm.dataItemManager(_self.document, {
        containerAccessor: 'data'
    , context: new SW.dc.PagingAdminContext({
        getURL: "/api/camsobjects/get/"
        , getManyURL: "/api/camsobjects/many/"
        , geAllURL: "/api/camsobjects/all/"
        , createURL: "/api/camsobjects/new/"
        , updateURL: "/api/camsobjects/update/"
    , deleteURL: "/api/camsobjects/delete/"
        , pageURL: "/api/camsobjects/page/"
    })
    , idleView: 'docobjectidle'
    , itemView: 'docobjectitem'
    , dbView: 'docobjectlist'

    , addAssociationUrl: "/api/documents/AddObjectToDocument/"
    , removeAssociationUrl: "/api/documents/RemoveObjectFromDocument/"
    }));

    this.register('themeContext', new SW.dc.AdminContext({
        getURL: "/api/themes/get/"
        , getManyURL: "/api/themes/many/"
        , geAllURL: "/api/themes/all/"
        , createURL: "/api/themes/new/"
        , updateURL: "/api/themes/update/"
        , deleteURL: "/api/themes/delete/"
    }));

    this.register('documentTypeList', new SW.documentTypeCollection());
    this.register('documentTemplateData', new SW.applyDocumentTemplateData());
    this.documentType = ko.observable(null);
    this.canApplyTemplate = ko.observable(false);

    this.updateDocument = ko.asyncCommand({

        execute: function (complete) {
            var doc = ko.mapping.toJSON(_self.document());


            _self.documentContext.update(doc, function () {

                if (SW.util.isFunction(complete)) {
                    complete();
                }

            });
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.getDocument = function (id, complete) {

        _self.documentContext.get(id, function (data) {

            var item = ko.mapping.fromJS(data, {});

            SW.vm.ViewModel.call(item, { typeName: "Document" });
            if (!item.responseHeaders) {
                item.responseHeaders = ko.observableArray();
            }
            if (!item.includes) {
                item.includes = ko.observableArray();
            }
            if (!item.parameters) {
                item.parameters = ko.observableArray();
            }
            if (!item.sections) {
                item.sections = ko.observableArray();
            }
            if (!item.tagGroups) {
                item.tagGroups = ko.observableArray();
            }
            if (!item.tags) {
                item.tags = ko.observableArray();
            }
            if (!item.rewrites) {
                item.rewrites = ko.observableArray();
            }
            if (!item.data) {
                item.data = ko.observableArray();
            }
            _self.document(item);

            if (SW.util.isFunction(complete)) {
                complete();
            }
        });
        getThemes();
    };

    this.returnToSite = ko.asyncCommand({

        execute: function (complete) {

            var url = SW.sess.deQueueLocation();

            if (SW.util.wasSameDomain(url)) {
                window.location = url;
            } else {
                var document = _self.document();
                if (document != null) {
                    window.location = "/CAMS/admin/sitestructure/" + document.siteId();
                }
            }
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });


    this.onTypeSelected = function (item) {

        var current = _self.documentType();
        if (current == item) {
            _self.documentType(null);
            _self.canApplyTemplate(false);
        } else {
            _self.documentType(item);
            _self.canApplyTemplate(true);
        }

    };

    this.applyTemplate = ko.asyncCommand({

        execute: function (complete) {

            var param = _self.document();
            var paramType = _self.documentType();
            if (param && paramType) {

                var id = SW.util.propVal(param.id);
                var typeId = SW.util.propVal(paramType.id);


                var applydata = SW.util.propVal(_self.documentTemplateData);

                SW.util.setProp(applydata.documentId, id);
                SW.util.setProp(applydata.documentTypeId, typeId);
                _self.documentContext.exePOST(_applyTemplateUrl, ko.mapping.toJSON(applydata), function () {
                    _self.getDocument(id, function () {
                        _self.documentType(null);
                        _self.canApplyTemplate(false);
                        complete();
                    });
                });

            }
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });


    function getThemes() {
        _self.themeContext.getAll(function (data) {
            ko.mapping.fromJS(data, {}, _self.themes);
        });
    }

    function configureSection() {
        var item = SW.util.propVal(_self.sectionManager.currentItem);
        if (item) {
            window.location = "/CAMS/admin/editsection/" + SW.util.propVal(item.id);
        }
    }

    function configureParameter() {
        var item = SW.util.propVal(_self.parameterManager.currentItem);
        if (item) {
            window.location = "/CAMS/admin/editparameter/" + SW.util.propVal(item.id);
        }
    }

    function configureScripts() {
        var item = SW.util.propVal(_self.scriptManager.currentItem);
        if (item) {
            window.location = "/CAMS/admin/editdocumentscript/" + SW.util.propVal(item.id);
        }
    }
};

SW.documentCollection = function () {

    var documentContext = new SW.dc.PagingAdminContext({
        getURL: "/api/documents/get/"
        , getManyURL: "/api/documents/many/"
        , geAllURL: "/api/documents/all/"
        , createURL: "/api/documents/new/"
        , updateURL: "/api/documents/update/"
        , deleteURL: "/api/documents/delete/"
        , pageURL: "/api/documents/page/"
    });

    SW.vm.ViewModel.call(this, { typeName: "DocumentCollection" });

    SW.vm.collections.data.PagingAdminCollection.call(this, {
        dataContext: documentContext, sortField: "name",
        collection: new SW.vm.collections.viewModelSelectableCollectionBase(),
        onCreate: function (item) {

            SW.vm.ViewModel.call(item, { typeName: "Document" });
        }
    });

};

//#endregion

//#region Document Scripts
SW.documentScriptEditor = function () {

    SW.vm.ViewModel.call(this, { typeName: "DocumentScriptEditor" });

    var _self = this;

    this.script = ko.observable(null);


    this.register('documentScriptContext', new SW.dc.AdminContext({
        getURL: "/api/documentscripts/get/"
        , getManyURL: "/api/documentscripts/many/"
        , geAllURL: "/api/documentscripts/all/"
        , createURL: "/api/documentscripts/new/"
        , updateURL: "/api/documentscripts/update/"
        , deleteURL: "/api/documentscripts/delete/"
    }));

    this.updateDocumentScript = ko.asyncCommand({

        execute: function (complete) {
            var doc = ko.mapping.toJSON(_self.script());


            _self.documentScriptContext.update(doc, function () {

                if (SW.util.isFunction(complete)) {
                    complete();
                }

            });
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.getDocumentScript = function (id, complete) {

        _self.documentScriptContext.get(id, function (data) {

            var item = ko.mapping.fromJS(data, {});

            SW.vm.ViewModel.call(item, { typeName: "DocumentScript" });

            if (!item.documentRetrieved) {
                item.documentRetrieved = ko.observable("");
            }
            if (!item.documentConverted) {
                item.documentConverted = ko.observable("");
            }
            if (!item.documentResolved) {
                item.documentResolved = ko.observable("");
            }

            _self.script(item);

            if (SW.util.isFunction(complete)) {
                complete();
            }
        });
    };

    this.returnToSite = ko.asyncCommand({

        execute: function (complete) {


            var url = SW.sess.deQueueLocation();

            if (SW.util.wasSameDomain(url)) {
                window.location = url;
            }
            if (SW.util.isFunction(complete)) {
                complete();
            }
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

v
};

//#endregion

//#region Sections
SW.sectionAdmin = function () {

    //Inherit from ViewModelBase
    var _self = this;
    SW.vm.ViewModel.call(this, { typeName: "SectionAdmin" });

    this.register('sectionList', new SW.sectionCollection());

    this.showDetailCommands = ko.observable(false);


    this.sectionList.collection.onSelected = function (item) {

        SW.sess.item('SectionManager').setRootVM(item);
        _self.showDetailCommands(true);

    };
    this.sectionList.collection.onDeselected = function () {
        var item = SW.sess.item('SectionManager').data('sectionAdmin').sectionList;

        SW.sess.item('SectionManager').setRootVM(item);
        _self.showDetailCommands(false);

    };
    this.sectionList.onRemoved = function () {
        this.collection.deselect();
    };
    this.sectionList.onUpdated = function () {
        this.collection.deselect();
    };
    this.sectionList.onCreated = function (item) {
        this.collection.select(item);
    };


    this.createSection = ko.asyncCommand({

        execute: function (complete) {
            _self.sectionList.create(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.removeSection = ko.asyncCommand({

        execute: function (complete) {
            _self.sectionList.remove(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });


    this.editSection = ko.asyncCommand({

        execute: function (complete) {

            var item = SW.util.propVal(_self.sectionList.collection.currentItem);
            if (item) {
                window.location = "/CAMS/admin/editsection/" + SW.util.propVal(item.id);
            }
            complete();
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.select = function (item) {
        if (_self.sectionList.collection.currentItem() === item) {
            _self.sectionList.collection.deselect();
        } else {
            _self.sectionList.collection.select(item);
        }
    };
};

SW.sectionEditor = function () {

    SW.vm.ViewModel.call(this, { typeName: "SectionEditor" });

    var _self = this;
    var _applyTemplateUrl = "/api/sections/applytemplate";

    this.section = ko.observable(null);
    this.themes = ko.observableArray();



    this.register('sectionContext', new SW.dc.AdminContext({
        getURL: "/api/sections/get/"
        , getManyURL: "/api/sections/many/"
        , geAllURL: "/api/sections/all/"
        , createURL: "/api/sections/new/"
        , updateURL: "/api/sections/update/"
        , deleteURL: "/api/sections/delete/"
    }));

    this.register('includeManager', new SW.vm.dataItemManager(_self.section, {
        containerAccessor: 'includes'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/includes/get/"
            , getManyURL: "/api/includes/many/"
            , geAllURL: "/api/includes/all/"
            , createURL: "/api/includes/new/"
            , updateURL: "/api/includes/update/"
        , deleteURL: "/api/includes/delete/"
            , pageURL: "/api/includes/page/"
        })
        , idleView: 'sectionincludeidle'
        , itemView: 'sectionincludeitem'
        , dbView: 'sectionincludelist'

        , addAssociationUrl: "/api/sections/AddIncludeToSection/"
        , removeAssociationUrl: "/api/sections/RemoveIncludeFromSection/"
    }));

    this.register('parameterManager', new SW.vm.dataItemManager(_self.section, {
        containerAccessor: 'parameters'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/parameters/get/"
            , getManyURL: "/api/parameters/many/"
            , geAllURL: "/api/parameters/all/"
            , createURL: "/api/parameters/new/"
            , updateURL: "/api/parameters/update/"
            , deleteURL: "/api/parameters/delete/"
            , pageURL: "/api/parameters/page/"
        })
        , idleView: 'sectionparameteridle'
        , itemView: 'sectionparameteritem'
        , dbView: 'sectionparameterlist'

        , addAssociationUrl: "/api/sections/AddParameterToSection/"
        , removeAssociationUrl: "/api/sections/RemoveParameterFromSection/"
        , onConfigureItem: configureParameter
    }));

    this.register('sectionManager', new SW.vm.dataItemManager(_self.section, {
        containerAccessor: 'childSections'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/sections/get/"
            , getManyURL: "/api/sections/many/"
            , geAllURL: "/api/sections/all/"
            , createURL: "/api/sections/new/"
            , updateURL: "/api/sections/update/"
            , deleteURL: "/api/sections/delete/"
            , pageURL: "/api/sections/page/"
        })
        , idleView: 'sectionsectionidle'
        , itemView: 'sectionsectionitem'
        , dbView: 'sectionsectionlist'

        , addAssociationUrl: "/api/sections/AddSectionToSection/"
        , removeAssociationUrl: "/api/sections/RemoveSectionFromSection/"
        , onConfigureItem: configureSection
    }));

    this.register('tagGroupManager', new SW.vm.dataItemManager(_self.section, {
        containerAccessor: 'tagGroups'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/taggroups/get/"
            , getManyURL: "/api/taggroups/many/"
            , geAllURL: "/api/taggroups/all/"
            , createURL: "/api/taggroups/new/"
            , updateURL: "/api/taggroups/update/"
            , deleteURL: "/api/taggroups/delete/"
            , pageURL: "/api/taggroups/page/"
        })
        , idleView: 'sectiontaggroupidle'
        , itemView: 'sectiontaggroupitem'
        , dbView: 'sectiontaggrouplist'

        , addAssociationUrl: "/api/sections/AddTagGroupToSection/"
        , removeAssociationUrl: "/api/sections/RemoveTagGroupFromSection/"
    }));

    this.register('tagManager', new SW.vm.dataItemManager(_self.section, {
        containerAccessor: 'tags'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/tags/get/"
            , getManyURL: "/api/tags/many/"
            , geAllURL: "/api/tags/all/"
            , createURL: "/api/tags/new/"
            , updateURL: "/api/tags/update/"
            , deleteURL: "/api/tags/delete/"
            , pageURL: "/api/tags/page/"
        })
        , idleView: 'sectiontagidle'
        , itemView: 'sectiontagitem'
        , dbView: 'sectiontaglist'

        , addAssociationUrl: "/api/sections/AddTagToSection/"
        , removeAssociationUrl: "/api/sections/RemoveTagFromSection/"
    }));

    this.register('objectManager', new SW.vm.dataItemManager(_self.section, {
        containerAccessor: 'data'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/camsobjects/get/"
            , getManyURL: "/api/camsobjects/many/"
            , geAllURL: "/api/camsobjects/all/"
            , createURL: "/api/camsobjects/new/"
            , updateURL: "/api/camsobjects/update/"
        , deleteURL: "/api/camsobjects/delete/"
            , pageURL: "/api/camsobjects/page/"
        })
        , idleView: 'sectionobjectidle'
        , itemView: 'sectionobjectitem'
        , dbView: 'sectionobjectlist'

        , addAssociationUrl: "/api/sections/AddObjectToSection/"
        , removeAssociationUrl: "/api/sections/RemoveObjectFromSection/"
            }));

    this.register('scriptManager', new SW.vm.dataItemManager(_self.section, {
        containerAccessor: 'scripts'
        , isCollection: false
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/sectionscripts/get/"
            , getManyURL: "/api/sectionscripts/many/"
            , geAllURL: "/api/sectionscripts/all/"
            , createURL: "/api/sectionscripts/new/"
            , updateURL: "/api/sectionscripts/update/"
            , deleteURL: "/api/sectionscripts/delete/"
            , pageURL: "/api/sectionscripts/page/"
        })
        , idleView: 'sectionscriptidle'
        , itemView: 'sectionscriptitem'
        , dbView: 'sectionscriptlist'

        , addAssociationUrl: "/api/sections/SetSectionScripts/"
        , removeAssociationUrl: "/api/sections/ClearSectionScripts/"
        , onConfigureItem: configureScripts
    }));

    this.register('themeContext', new SW.dc.AdminContext({
        getURL: "/api/themes/get/"
    , getManyURL: "/api/themes/many/"
    , geAllURL: "/api/themes/all/"
    , createURL: "/api/themes/new/"
    , updateURL: "/api/themes/update/"
    , deleteURL: "/api/themes/delete/"
    }));

    this.register('sectionTypeList', new SW.sectionTypeCollection());
    this.register('sectionTemplateData', new SW.applySectionTemplateData());
    this.sectionType = ko.observable(null);
    this.canApplyTemplate = ko.observable(false);

    this.updateSection = ko.asyncCommand({

        execute: function (complete) {
            var doc = ko.mapping.toJSON(_self.section());


            _self.sectionContext.update(doc, function () {

                if (SW.util.isFunction(complete)) {
                    complete();
                }

            });
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.getSection = function (id, complete) {

        _self.sectionContext.get(id, function (data) {

            var item = ko.mapping.fromJS(data, {});

            SW.vm.ViewModel.call(item, { typeName: "Section" });
         
            if (!item.includes) {
                item.includes = ko.observableArray();
            }
            if (!item.parameters) {
                item.parameters = ko.observableArray();
            }
            if (!item.childSections) {
                item.childSections = ko.observableArray();
            }
            if (!item.tagGroups) {
                item.tagGroups = ko.observableArray();
            }
            if (!item.tags) {
                item.tags = ko.observableArray();
            }
            if (!item.data) {
                item.data = ko.observableArray();
            }
            _self.section(item);

            if (SW.util.isFunction(complete)) {
                complete();
            }
        });
        getThemes();
    };

    this.returnToSite = ko.asyncCommand({

        execute: function (complete) {

            var url = SW.sess.deQueueLocation();

            if (SW.util.wasSameDomain(url)) {
                window.location = url;
            } else {
                var section = _self.section();
                if (section != null) {
                    window.location = "/CAMS/admin/sitestructure/" + section.site().id();
                }
            }
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.onTypeSelected = function (item) {

        var current = _self.sectionType();
        if (current == item) {
            _self.sectionType(null);
            _self.canApplyTemplate(false);
        } else {
            _self.sectionType(item);
            _self.canApplyTemplate(true);
        }

    };

    this.applyTemplate = ko.asyncCommand({

        execute: function (complete) {

            var param = _self.section();
            var paramType = _self.sectionType();
            if (param && paramType) {

                var id = SW.util.propVal(param.id);
                var typeId = SW.util.propVal(paramType.id);


                var applydata = SW.util.propVal(_self.sectionTemplateData);

                SW.util.setProp(applydata.sectionId, id);
                SW.util.setProp(applydata.sectionTypeId, typeId);
                _self.sectionContext.exePOST(_applyTemplateUrl, ko.mapping.toJSON(applydata), function () {
                    _self.getSection(id, function () {
                        _self.sectionType(null);
                        _self.canApplyTemplate(false);
                        complete();
                    });
                });

            }
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    function getThemes() {
        _self.themeContext.getAll(function (data) {
            ko.mapping.fromJS(data, {}, _self.themes);
        });
    }

    function configureSection() {
        var item = SW.util.propVal(_self.sectionManager.currentItem);
        if (item) {
            window.location = "/CAMS/admin/editsection/" + SW.util.propVal(item.id);
        }
    }

    function configureParameter() {
        var item = SW.util.propVal(_self.parameterManager.currentItem);
        if (item) {
            window.location = "/CAMS/admin/editparameter/" + SW.util.propVal(item.id);
        }
    }

    function configureScripts() {
        var item = SW.util.propVal(_self.scriptManager.currentItem);
        if (item) {
            window.location = "/CAMS/admin/editsectionscript/" + SW.util.propVal(item.id);
        }
    }
};

SW.sectionCollection = function () {

    var sectionContext = new SW.dc.PagingAdminContext({
        getURL: "/api/sections/get/"
        , getManyURL: "/api/sections/many/"
        , geAllURL: "/api/sections/all/"
        , createURL: "/api/sections/new/"
        , updateURL: "/api/sections/update/"
        , deleteURL: "/api/sections/delete/"
        , pageURL: "/api/sections/page/"
    });

    SW.vm.ViewModel.call(this, { typeName: "SectionCollection" });

    SW.vm.collections.data.PagingAdminCollection.call(this, {
        dataContext: sectionContext, sortField: "name",
        collection: new SW.vm.collections.viewModelSelectableCollectionBase(),
        onCreate: function (item) {

            SW.vm.ViewModel.call(item, { typeName: "Section" });
        }
    });

};

//#endregion

//#region Section Scripts
SW.sectionScriptEditor = function () {

    SW.vm.ViewModel.call(this, { typeName: "SectionScriptEditor" });

    var _self = this;

    this.script = ko.observable(null);


    this.register('sectionScriptContext', new SW.dc.AdminContext({
        getURL: "/api/sectionscripts/get/"
        , getManyURL: "/api/sectionscripts/many/"
        , geAllURL: "/api/sectionscripts/all/"
        , createURL: "/api/sectionscripts/new/"
        , updateURL: "/api/sectionscripts/update/"
        , deleteURL: "/api/sectionscripts/delete/"
    }));

    this.updateSectionScript = ko.asyncCommand({

        execute: function (complete) {
            var doc = ko.mapping.toJSON(_self.script());


            _self.sectionScriptContext.update(doc, function () {

                if (SW.util.isFunction(complete)) {
                    complete();
                }

            });
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.getSectionScript = function (id, complete) {

        _self.sectionScriptContext.get(id, function (data) {

            var item = ko.mapping.fromJS(data, {});

            SW.vm.ViewModel.call(item, { typeName: "SectionScript" });

            if (!item.sectionRetrieved) {
                item.sectionRetrieved = ko.observable("");
            }
            if (!item.sectionConverted) {
                item.sectionConverted = ko.observable("");
            }
            if (!item.sectionResolved) {
                item.sectionResolved = ko.observable("");
            }

            _self.script(item);

            if (SW.util.isFunction(complete)) {
                complete();
            }
        });
    };

    this.returnToSite = ko.asyncCommand({

        execute: function (complete) {


            var url = SW.sess.deQueueLocation();

            if (SW.util.wasSameDomain(url)) {
                window.location = url;
            }
            if (SW.util.isFunction(complete)) {
                complete();
            }
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.currentLang = ko.computed({
        read: function () {

            var result = 'javascript';

            if (_self.script() != null) {
                var script = _self.script();
                if (script.language) {
                    var lang = script.language();
                    switch (lang) {
                        case "CS":
                            result = 'csharp';
                            break;
                        case "JS":
                            result = 'javascript';
                            break;
                        case "PY":
                            result = 'python';
                            break;
                        case "RB":
                            result = 'ruby';
                            break;
                        default:
                            break;
                    }
                }
            }
            return result;
        }
    });
};

//#endregion

//#region Parameters

SW.parameterAdmin = function () {

    //Inherit from ViewModelBase
    var _self = this;
    SW.vm.ViewModel.call(this, { typeName: "ParameterAdmin" });

    this.register('parameterList', new SW.parameterCollection());

    this.showDetailCommands = ko.observable(false);


    this.parameterList.collection.onSelected = function (item) {

        SW.sess.item('ParameterManager').setRootVM(item);
        _self.showDetailCommands(true);

    };
    this.parameterList.collection.onDeselected = function () {
        var item = SW.sess.item('ParameterManager').data('parameterAdmin').parameterList;

        SW.sess.item('ParameterManager').setRootVM(item);
        _self.showDetailCommands(false);

    };
    this.parameterList.onRemoved = function () {
        this.collection.deselect();
    };
    this.parameterList.onUpdated = function () {
        this.collection.deselect();
    };
    this.parameterList.onCreated = function (item) {
        this.collection.select(item);
    };


    this.createParameter = ko.asyncCommand({

        execute: function (complete) {
            _self.parameterList.create(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.removeParameter = ko.asyncCommand({

        execute: function (complete) {
            _self.parameterList.remove(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });


    this.editParameter = ko.asyncCommand({

        execute: function (complete) {

            var item = SW.util.propVal(_self.parameterList.collection.currentItem);
            if (item) {
                window.location = "/CAMS/admin/editparameter/" + SW.util.propVal(item.id);
            }
            complete();
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.select = function (item) {
        if (_self.parameterList.collection.currentItem() === item) {
            _self.parameterList.collection.deselect();
        } else {
            _self.parameterList.collection.select(item);
        }
    };
};

SW.parameterEditor = function () {

    SW.vm.ViewModel.call(this, { typeName: "ParameterEditor" });

    var _self = this;
    var _applyTemplateUrl = "/api/parameters/applytemplate";

    this.parameter = ko.observable(null);


    this.register('parameterContext', new SW.dc.AdminContext({
        getURL: "/api/parameters/get/"
        , getManyURL: "/api/parameters/many/"
        , geAllURL: "/api/parameters/all/"
        , createURL: "/api/parameters/new/"
        , updateURL: "/api/parameters/update/"
        , deleteURL: "/api/parameters/delete/"
    }));

    this.register('tagGroupManager', new SW.vm.dataItemManager(_self.parameter, {
        containerAccessor: 'tagGroups'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/taggroups/get/"
            , getManyURL: "/api/taggroups/many/"
            , geAllURL: "/api/taggroups/all/"
            , createURL: "/api/taggroups/new/"
            , updateURL: "/api/taggroups/update/"
            , deleteURL: "/api/taggroups/delete/"
            , pageURL: "/api/taggroups/page/"
        })
        , idleView: 'parametertaggroupidle'
        , itemView: 'parametertaggroupitem'
        , dbView: 'parametertaggrouplist'

        , addAssociationUrl: "/api/parameters/AddTagGroupToParameter/"
        , removeAssociationUrl: "/api/parameters/RemoveTagGroupFromParameter/"
    }));

    this.register('tagManager', new SW.vm.dataItemManager(_self.parameter, {
        containerAccessor: 'tags'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/tags/get/"
            , getManyURL: "/api/tags/many/"
            , geAllURL: "/api/tags/all/"
            , createURL: "/api/tags/new/"
            , updateURL: "/api/tags/update/"
            , deleteURL: "/api/tags/delete/"
            , pageURL: "/api/tags/page/"
        })
        , idleView: 'parametertagidle'
        , itemView: 'parametertagitem'
        , dbView: 'parametertaglist'

        , addAssociationUrl: "/api/parameters/AddTagToParameter/"
        , removeAssociationUrl: "/api/parameters/RemoveTagFromParameter/"
    }));

    this.register('scriptManager', new SW.vm.dataItemManager(_self.parameter, {
        containerAccessor: 'scripts'
        , isCollection: false
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/parameterscripts/get/"
            , getManyURL: "/api/parameterscripts/many/"
            , geAllURL: "/api/parameterscripts/all/"
            , createURL: "/api/parameterscripts/new/"
            , updateURL: "/api/parameterscripts/update/"
            , deleteURL: "/api/parameterscripts/delete/"
            , pageURL: "/api/parameterscripts/page/"
        })
        , idleView: 'parameterscriptidle'
        , itemView: 'parameterscriptitem'
        , dbView: 'parameterscriptlist'

        , addAssociationUrl: "/api/parameters/SetParameterScripts/"
        , removeAssociationUrl: "/api/parameters/ClearParameterScripts/"
        , onConfigureItem: configureScripts
    }));

    this.register('parameterTypeList', new SW.parameterTypeCollection());
    this.register('parameterTemplateData', new SW.applyParameterTemplateData());
    this.register('assetManager', new SW.assetManager());

    this.parameterType = ko.observable(null);
    this.canApplyTemplate = ko.observable(false);

    this.canDisplayFiles = ko.observable(false); 

    this.updateParameter = ko.asyncCommand({

        execute: function (complete) {


            var doc = ko.mapping.toJSON(_self.parameter());


            _self.parameterContext.update(doc, function () {

                if (SW.util.isFunction(complete)) {
                    complete();
                }

            });
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.getParameter = function (id, complete) {

        _self.parameterContext.get(id, function (data) {

            var item = ko.mapping.fromJS(data, {});

            SW.vm.ViewModel.call(item, { typeName: "Parameter" });

            if (!item.tagGroups) {
                item.tagGroups = ko.observableArray();
            }
            if (!item.tags) {
                item.tags = ko.observableArray();
            }
            _self.parameter(item);

            if (SW.util.isFunction(complete)) {
                complete();
            }
        });
    };

    this.onTypeSelected = function (item) {

        var current = _self.parameterType();
        if (current == item) {
            _self.parameterType(null);
            _self.canApplyTemplate(false);
        } else {
            _self.parameterType(item);
            _self.canApplyTemplate(true);
        }

    };

    this.applyTemplate = ko.asyncCommand({

        execute: function (complete) {
       
            var param = _self.parameter();
            var paramType = _self.parameterType();
            if (param && paramType) {

                var id = SW.util.propVal(param.id);
                var typeId = SW.util.propVal(paramType.id);


                var applydata = SW.util.propVal(_self.parameterTemplateData);

                SW.util.setProp(applydata.parameterId, id);
                SW.util.setProp(applydata.parameterTypeId, typeId);
                _self.parameterContext.exePOST(_applyTemplateUrl, ko.mapping.toJSON(applydata), function () {
                    _self.getParameter(id, function () {
                        _self.parameterType(null);
                        _self.canApplyTemplate(false);
                        complete();
                    });
                });

            }
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.selectAsset = function () {
        $.Dialog({
            'title': 'My dialog title',
            'content': '<div data-bind="template: assetselector"></div>',
            'draggable': true,
            'overlay': true,
            'closeButton': true,
            'buttonsAlign': 'right',
            'keepOpened': true,
            'position': {
                'zone': 'right'
            },
            'buttons': {
                'button1': {
                    'action': function () { }
                },
                'button2': {
                    'action': function () { }
                }
            }
        });
    };

    this.toggleFiles = function () {
        if (_self.canDisplayFiles() === true) {
            _self.canDisplayFiles(false)
        } else {
            _self.canDisplayFiles(true)
        }
    }
    
    this.selectAsFile = function () {
        var file = _self.assetManager.currentFile();
        if (file) {
            var param = _self.parameter();
            param.value(file.name());
            _self.canDisplayFiles(false);
        }
    }
    this.selectAsImage = function () {
        var file = _self.assetManager.currentFile();
        if (file) {
            var param = _self.parameter();
            param.value('<img src="' + file.name() + '"/>');
            _self.canDisplayFiles(false);
        }
    }

    this.returnToSite = ko.asyncCommand({

        execute: function (complete) {


            var url = SW.sess.deQueueLocation();

            if (SW.util.wasSameDomain(url)) {
                window.location = url;
            } else {
                var parameter = _self.parameter();
                if (parameter != null) {
                    window.location = "/CAMS/admin/sitestructure/" + parameter.site().id();
                }
            }
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    function configureScripts() {
        var item = SW.util.propVal(_self.scriptManager.currentItem);
        if (item) {
            window.location = "/CAMS/admin/editparameterscript/" + SW.util.propVal(item.id);
        }
    }
};

SW.parameterCollection = function () {

    var parameterContext = new SW.dc.PagingAdminContext({
        getURL: "/api/parameters/get/"
        , getManyURL: "/api/parameters/many/"
        , geAllURL: "/api/parameters/all/"
        , createURL: "/api/parameters/new/"
        , updateURL: "/api/parameters/update/"
        , deleteURL: "/api/parameters/delete/"
        , pageURL: "/api/parameters/page/"
    });

    SW.vm.ViewModel.call(this, { typeName: "ParameterCollection" });

    SW.vm.collections.data.PagingAdminCollection.call(this, {
        dataContext: parameterContext, sortField: "name",
        collection: new SW.vm.collections.viewModelSelectableCollectionBase(),
        onCreate: function (item) {

            SW.vm.ViewModel.call(item, { typeName: "Parameter" });
        }
    });

};

//#endregion

//#region Parameter Scripts
SW.parameterScriptEditor = function () {

    SW.vm.ViewModel.call(this, { typeName: "ParameterScriptEditor" });

    var _self = this;

    this.script = ko.observable(null);


    this.register('parameterScriptContext', new SW.dc.AdminContext({
        getURL: "/api/parameterscripts/get/"
        , getManyURL: "/api/parameterscripts/many/"
        , geAllURL: "/api/parameterscripts/all/"
        , createURL: "/api/parameterscripts/new/"
        , updateURL: "/api/parameterscripts/update/"
        , deleteURL: "/api/parameterscripts/delete/"
    }));

    this.updateParameterScript = ko.asyncCommand({

        execute: function (complete) {
            var doc = ko.mapping.toJSON(_self.script());


            _self.parameterScriptContext.update(doc, function () {

                if (SW.util.isFunction(complete)) {
                    complete();
                }

            });
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.getParameterScript = function (id, complete) {

        _self.parameterScriptContext.get(id, function (data) {

            var item = ko.mapping.fromJS(data, {});

            SW.vm.ViewModel.call(item, { typeName: "ParameterScript" });

            if (!item.parameterRetrieved) {
                item.parameterRetrieved = ko.observable("");
            }
            if (!item.parameterConverted) {
                item.parameterConverted = ko.observable("");
            }
            if (!item.parameterResolved) {
                item.parameterResolved = ko.observable("");
            }

            _self.script(item);

            if (SW.util.isFunction(complete)) {
                complete();
            }
        });
    };

    this.returnToSite = ko.asyncCommand({

        execute: function (complete) {


            var url = SW.sess.deQueueLocation();

            if (SW.util.wasSameDomain(url)) {
                window.location = url;
            }
            if (SW.util.isFunction(complete)) {
                complete();
            }
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.currentLang = ko.computed({
        read: function () {

            var result = 'javascript';

            if (_self.script() != null) {
                var script = _self.script();
                if (script.language) {
                    var lang = script.language();
                    switch (lang) {
                        case "CS":
                            result = 'csharp';
                            break;
                        case "JS":
                            result = 'javascript';
                            break;
                        case "PY":
                            result = 'python';
                            break;
                        case "RB":
                            result = 'ruby';
                            break;
                        default:
                            break;
                    }
                }
            }
            return result;
        }
    });
};

//#endregion


//#region TagGroups
SW.tagGroupCollection = function () {

    var tagGroupContext = new SW.dc.PagingAdminContext({
        getURL: "/api/tagGroups/get/"
        , getManyURL: "/api/tagGroups/many/"
        , geAllURL: "/api/tagGroups/all/"
        , createURL: "/api/tagGroups/new/"
        , updateURL: "/api/tagGroups/update/"
        , deleteURL: "/api/tagGroups/delete/"
        , pageURL: "/api/tagGroups/page/"
    });

    SW.vm.ViewModel.call(this, { typeName: "TagGroupCollection" });

    SW.vm.collections.data.PagingAdminCollection.call(this, {
        dataContext: tagGroupContext, sortField: "name",
        collection: new SW.vm.collections.viewModelSelectableCollectionBase(),
        onCreate: function (item) {

            SW.vm.ViewModel.call(item, { typeName: "TagGroup" });
        }
    });

};

//#endregion


//#region Tags
SW.tagCollection = function () {

    var tagContext = new SW.dc.PagingAdminContext({
        getURL: "/api/tags/get/"
        , getManyURL: "/api/tags/many/"
        , geAllURL: "/api/tags/all/"
        , createURL: "/api/tags/new/"
        , updateURL: "/api/tags/update/"
        , deleteURL: "/api/tags/delete/"
        , pageURL: "/api/tags/page/"
    });

    SW.vm.ViewModel.call(this, { typeName: "TagCollection" });

    SW.vm.collections.data.PagingAdminCollection.call(this, {
        dataContext: tagContext, sortField: "name",
        collection: new SW.vm.collections.viewModelSelectableCollectionBase(),
        onCreate: function (item) {

            SW.vm.ViewModel.call(item, { typeName: "Tag" });
        }
    });

};

//#endregion


//#region Headers


SW.headerAdmin = function () {

    //Inherit from ViewModelBase
    var _self = this;
    SW.vm.ViewModel.call(this, { typeName: "HeaderAdmin" });

    this.register('headerList', new SW.headerCollection());

    this.showDetailCommands = ko.observable(false);


    this.headerList.collection.onSelected = function (item) {

        SW.sess.item('HeaderManager').setRootVM(item);
        _self.showDetailCommands(true);

    };
    this.headerList.collection.onDeselected = function () {
        var item = SW.sess.item('HeaderManager').data('headerAdmin').headerList;

        SW.sess.item('HeaderManager').setRootVM(item);
        _self.showDetailCommands(false);

    };
    this.headerList.onRemoved = function () {
        this.collection.deselect();
    };
    this.headerList.onUpdated = function () {
        this.collection.deselect();
    };
    this.headerList.onCreated = function (item) {
        this.collection.select(item);
    };


    this.createHeader = ko.asyncCommand({

        execute: function (complete) {
            _self.headerList.create(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.removeHeader = ko.asyncCommand({

        execute: function (complete) {
            _self.headerList.remove(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });


    this.editHeader = ko.asyncCommand({

        execute: function (complete) {

            var item = SW.util.propVal(_self.headerList.collection.currentItem);
            if (item) {
                window.location = "/CAMS/admin/editheader/" + SW.util.propVal(item.id);
            }
            complete();
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.select = function (item) {
        if (_self.headerList.collection.currentItem() === item) {
            _self.headerList.collection.deselect();
        } else {
            _self.headerList.collection.select(item);
        }
    };
};

SW.headerEditor = function () {

    SW.vm.ViewModel.call(this, { typeName: "HeaderEditor" });

    var _self = this;

    this.header = ko.observable(null);
    this.headers = ko.observableArray();



    this.register('headerContext', new SW.dc.AdminContext({
        getURL: "/api/headers/get/"
        , getManyURL: "/api/headers/many/"
        , geAllURL: "/api/headers/all/"
        , createURL: "/api/headers/new/"
        , updateURL: "/api/headers/update/"
        , deleteURL: "/api/headers/delete/"
    }));

    this.updateHeader = ko.asyncCommand({

        execute: function (complete) {
            var doc = ko.mapping.toJSON(_self.header());


            _self.headerContext.update(doc, function () {

                if (SW.util.isFunction(complete)) {
                    complete();
                }

            });
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.getHeader = function (id, complete) {

        _self.headerContext.get(id, function (data) {

            var item = ko.mapping.fromJS(data, {});

            SW.vm.ViewModel.call(item, { typeName: "Header" });

            if (!item.headers) {
                item.headers = ko.observableArray();
            }
            _self.header(item);

            if (SW.util.isFunction(complete)) {
                complete();
            }
        });
    };

    this.returnToSite = ko.asyncCommand({

        execute: function (complete) {

            var url = SW.sess.deQueueLocation();

            if (SW.util.wasSameDomain(url)) {
                window.location = url;
            } else {
                var header = _self.header();
                if (header != null) {
                    window.location = "/CAMS/admin/sitestructure/" + header.site().id();
                }
            }
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

};

SW.headerCollection = function () {

    var headerContext = new SW.dc.PagingAdminContext({
        getURL: "/api/headers/get/"
        , getManyURL: "/api/headers/many/"
        , geAllURL: "/api/headers/all/"
        , createURL: "/api/headers/new/"
        , updateURL: "/api/headers/update/"
        , deleteURL: "/api/headers/delete/"
        , pageURL: "/api/headers/page/"
    });

    SW.vm.ViewModel.call(this, { typeName: "HeaderCollection" });

    SW.vm.collections.data.PagingAdminCollection.call(this, {
        dataContext: headerContext, sortField: "name",
        collection: new SW.vm.collections.viewModelSelectableCollectionBase(),
        onCreate: function (item) {

            SW.vm.ViewModel.call(item, { typeName: "Header" });
        }
    });

};

//#endregion


//#region Includes


SW.includeAdmin = function () {

    //Inherit from ViewModelBase
    var _self = this;
    SW.vm.ViewModel.call(this, { typeName: "IncludeAdmin" });

    this.register('includeList', new SW.includeCollection());

    this.showDetailCommands = ko.observable(false);


    this.includeList.collection.onSelected = function (item) {

        SW.sess.item('IncludeManager').setRootVM(item);
        _self.showDetailCommands(true);

    };
    this.includeList.collection.onDeselected = function () {
        var item = SW.sess.item('IncludeManager').data('includeAdmin').includeList;

        SW.sess.item('IncludeManager').setRootVM(item);
        _self.showDetailCommands(false);

    };
    this.includeList.onRemoved = function () {
        this.collection.deselect();
    };
    this.includeList.onUpdated = function () {
        this.collection.deselect();
    };
    this.includeList.onCreated = function (item) {
        this.collection.select(item);
    };


    this.createInclude = ko.asyncCommand({

        execute: function (complete) {
            _self.includeList.create(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.removeInclude = ko.asyncCommand({

        execute: function (complete) {
            _self.includeList.remove(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });


    this.editInclude = ko.asyncCommand({

        execute: function (complete) {

            var item = SW.util.propVal(_self.includeList.collection.currentItem);
            if (item) {
                window.location = "/CAMS/admin/editinclude/" + SW.util.propVal(item.id);
            }
            complete();
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.select = function (item) {
        if (_self.includeList.collection.currentItem() === item) {
            _self.includeList.collection.deselect();
        } else {
            _self.includeList.collection.select(item);
        }
    };
};

SW.includeEditor = function () {

    SW.vm.ViewModel.call(this, { typeName: "IncludeEditor" });

    var _self = this;

    this.include = ko.observable(null);
    this.includes = ko.observableArray();



    this.register('includeContext', new SW.dc.AdminContext({
        getURL: "/api/includes/get/"
        , getManyURL: "/api/includes/many/"
        , geAllURL: "/api/includes/all/"
        , createURL: "/api/includes/new/"
        , updateURL: "/api/includes/update/"
        , deleteURL: "/api/includes/delete/"
    }));

    this.updateInclude = ko.asyncCommand({

        execute: function (complete) {
            var doc = ko.mapping.toJSON(_self.include());


            _self.includeContext.update(doc, function () {

                if (SW.util.isFunction(complete)) {
                    complete();
                }

            });
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.getInclude = function (id, complete) {

        _self.includeContext.get(id, function (data) {

            var item = ko.mapping.fromJS(data, {});

            SW.vm.ViewModel.call(item, { typeName: "Include" });

            if (!item.includes) {
                item.includes = ko.observableArray();
            }
            _self.include(item);

            if (SW.util.isFunction(complete)) {
                complete();
            }
        });
    };

    this.returnToSite = ko.asyncCommand({

        execute: function (complete) {

            var url = SW.sess.deQueueLocation();

            if (SW.util.wasSameDomain(url)) {
                window.location = url;
            } else {
                var include = _self.include();
                if (include != null) {
                    window.location = "/CAMS/admin/sitestructure/" + include.site().id();
                }
            }
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

};

SW.includeCollection = function () {

    var includeContext = new SW.dc.PagingAdminContext({
        getURL: "/api/includes/get/"
        , getManyURL: "/api/includes/many/"
        , geAllURL: "/api/includes/all/"
        , createURL: "/api/includes/new/"
        , updateURL: "/api/includes/update/"
        , deleteURL: "/api/includes/delete/"
        , pageURL: "/api/includes/page/"
    });

    SW.vm.ViewModel.call(this, { typeName: "IncludeCollection" });

    SW.vm.collections.data.PagingAdminCollection.call(this, {
        dataContext: includeContext, sortField: "name",
        collection: new SW.vm.collections.viewModelSelectableCollectionBase(),
        onCreate: function (item) {

            SW.vm.ViewModel.call(item, { typeName: "Include" });
        }
    });

};

//#endregion


//#region Themes

SW.themeAdmin = function () {

    //Inherit from ViewModelBase
    var _self = this;
    SW.vm.ViewModel.call(this, { typeName: "ThemeAdmin" });

    this.register('themeList', new SW.themeCollection());

    this.showDetailCommands = ko.observable(false);


    this.themeList.collection.onSelected = function (item) {

        SW.sess.item('ThemeManager').setRootVM(item);
        _self.showDetailCommands(true);

    };
    this.themeList.collection.onDeselected = function () {
        var item = SW.sess.item('ThemeManager').data('themeAdmin').themeList;

        SW.sess.item('ThemeManager').setRootVM(item);
        _self.showDetailCommands(false);

    };
    this.themeList.onRemoved = function () {
        this.collection.deselect();
    };
    this.themeList.onUpdated = function () {
        this.collection.deselect();
    };
    this.themeList.onCreated = function (item) {
        this.collection.select(item);
    };


    this.createTheme = ko.asyncCommand({

        execute: function (complete) {
            _self.themeList.create(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.removeTheme = ko.asyncCommand({

        execute: function (complete) {
            _self.themeList.remove(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });


    this.editTheme = ko.asyncCommand({

        execute: function (complete) {

            var item = SW.util.propVal(_self.themeList.collection.currentItem);
            if (item) {
                window.location = "/CAMS/admin/edittheme/" + SW.util.propVal(item.id);
            }
            complete();
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.select = function (item) {
        if (_self.themeList.collection.currentItem() === item) {
            _self.themeList.collection.deselect();
        } else {
            _self.themeList.collection.select(item);
        }
    };
};

SW.themeEditor = function () {

    SW.vm.ViewModel.call(this, { typeName: "ThemeEditor" });

    var _self = this;

    this.theme = ko.observable(null);
    this.themes = ko.observableArray();



    this.register('themeContext', new SW.dc.AdminContext({
        getURL: "/api/themes/get/"
        , getManyURL: "/api/themes/many/"
        , geAllURL: "/api/themes/all/"
        , createURL: "/api/themes/new/"
        , updateURL: "/api/themes/update/"
        , deleteURL: "/api/themes/delete/"
    }));

    this.register('includeManager', new SW.vm.dataItemManager(_self.theme, {
        containerAccessor: 'includes'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/includes/get/"
            , getManyURL: "/api/includes/many/"
            , geAllURL: "/api/includes/all/"
            , createURL: "/api/includes/new/"
            , updateURL: "/api/includes/update/"
        , deleteURL: "/api/includes/delete/"
            , pageURL: "/api/includes/page/"
        })
        , idleView: 'themeincludeidle'
        , itemView: 'themeincludeitem'
        , dbView: 'themeincludelist'

        , addAssociationUrl: "/api/themes/AddIncludeToTheme/"
        , removeAssociationUrl: "/api/themes/RemoveIncludeFromTheme/"
    }));

   
    this.updateTheme = ko.asyncCommand({

        execute: function (complete) {
            var doc = ko.mapping.toJSON(_self.theme());


            _self.themeContext.update(doc, function () {

                if (SW.util.isFunction(complete)) {
                    complete();
                }

            });
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.getTheme = function (id, complete) {

        _self.themeContext.get(id, function (data) {

            var item = ko.mapping.fromJS(data, {});

            SW.vm.ViewModel.call(item, { typeName: "Theme" });

            if (!item.includes) {
                item.includes = ko.observableArray();
            }
            _self.theme(item);

            if (SW.util.isFunction(complete)) {
                complete();
            }
        });
    };

    this.returnToSite = ko.asyncCommand({

        execute: function (complete) {

            var url = SW.sess.deQueueLocation();

            if (SW.util.wasSameDomain(url)) {
                window.location = url;
            } else {
                var theme = _self.theme();
                if (theme != null) {
                    window.location = "/CAMS/admin/sitestructure/" + theme.site().id();
                }
            }
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

};

SW.themeCollection = function () {

    var themeContext = new SW.dc.PagingAdminContext({
        getURL: "/api/themes/get/"
        , getManyURL: "/api/themes/many/"
        , geAllURL: "/api/themes/all/"
        , createURL: "/api/themes/new/"
        , updateURL: "/api/themes/update/"
        , deleteURL: "/api/themes/delete/"
        , pageURL: "/api/themes/page/"
    });

    SW.vm.ViewModel.call(this, { typeName: "ThemeCollection" });

    SW.vm.collections.data.PagingAdminCollection.call(this, {
        dataContext: themeContext, sortField: "name",
        collection: new SW.vm.collections.viewModelSelectableCollectionBase(),
        onCreate: function (item) {

            SW.vm.ViewModel.call(item, { typeName: "Theme" });
        }
    });

};

//#endregion


//#region Content Templates
SW.contentTemplateAdmin = function () {

    //Inherit from ViewModelBase
    var _self = this;
    SW.vm.ViewModel.call(this, { typeName: "ContentTemplateAdmin" });

    this.register('contentTemplateList', new SW.contentTemplateCollection());

    this.showDetailCommands = ko.observable(false);


    this.contentTemplateList.collection.onSelected = function (item) {

        SW.sess.item('ContentTemplateManager').setRootVM(item);
        _self.showDetailCommands(true);

    };
    this.contentTemplateList.collection.onDeselected = function () {
        var item = SW.sess.item('ContentTemplateManager').data('contentTemplateAdmin').contentTemplateList;

        SW.sess.item('ContentTemplateManager').setRootVM(item);
        _self.showDetailCommands(false);

    };
    this.contentTemplateList.onRemoved = function () {
        this.collection.deselect();
    };
    this.contentTemplateList.onUpdated = function () {
        this.collection.deselect();
    };
    this.contentTemplateList.onCreated = function (item) {
        this.collection.select(item);
    };


    this.createContentTemplate = ko.asyncCommand({

        execute: function (complete) {
            _self.contentTemplateList.create(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });


    this.updateContentTemplate = ko.asyncCommand({

        execute: function (complete) {
            _self.contentTemplateList.update(complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.removeContentTemplate = ko.asyncCommand({

        execute: function (complete) {
            _self.contentTemplateList.remove(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });
};

SW.contentTemplateCollection = function () {

    var contentTemplateContext = new SW.dc.PagingAdminContext({
        getURL: "/api/contentTemplates/get/"
        , getManyURL: "/api/contentTemplates/many/"
        , geAllURL: "/api/contentTemplates/all/"
        , createURL: "/api/contentTemplates/new/"
        , updateURL: "/api/contentTemplates/update/"
        , deleteURL: "/api/contentTemplates/delete/"
        , pageURL: "/api/contentTemplates/page/"
    });

    SW.vm.ViewModel.call(this, { typeName: "ContentTemplateCollection" });

    SW.vm.collections.data.PagingAdminCollection.call(this, {
        dataContext: contentTemplateContext, sortField: "name",
        collection: new SW.vm.collections.viewModelSelectableCollectionBase(),
        onCreate: function (item) {

            SW.vm.ViewModel.call(item, { typeName: "ContentTemplate" });
        }
    });

};
//#endregion


//#region DocumentTypes
SW.documentTypeAdmin = function () {

    //Inherit from ViewModelBase
    var _self = this;
    SW.vm.ViewModel.call(this, { typeName: "DocumentTypeAdmin" });

    this.register('documentTypeList', new SW.documentTypeCollection());

    this.showDetailCommands = ko.observable(false);


    this.documentTypeList.collection.onSelected = function (item) {

        SW.sess.item('DocumentTypeManager').setRootVM(item);
        _self.showDetailCommands(true);

    };
    this.documentTypeList.collection.onDeselected = function () {
        var item = SW.sess.item('DocumentTypeManager').data('documentTypeAdmin').documentTypeList;

        SW.sess.item('DocumentTypeManager').setRootVM(item);
        _self.showDetailCommands(false);

    };
    this.documentTypeList.onRemoved = function () {
        this.collection.deselect();
    };
    this.documentTypeList.onUpdated = function () {
        this.collection.deselect();
    };
    this.documentTypeList.onCreated = function (item) {
        this.collection.select(item);
    };


    this.createDocumentType = ko.asyncCommand({

        execute: function (complete) {
            _self.documentTypeList.create(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.removeDocumentType = ko.asyncCommand({

        execute: function (complete) {
            _self.documentTypeList.remove(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });


    this.editDocumentType = ko.asyncCommand({

        execute: function (complete) {

            var item = SW.util.propVal(_self.documentTypeList.collection.currentItem);
            if (item) {
                window.location = "/CAMS/admin/editdocumentType/" + SW.util.propVal(item.id);
            }
            complete();
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.select = function (item) {
        if (_self.documentTypeList.collection.currentItem() === item) {
            _self.documentTypeList.collection.deselect();
        } else {
            _self.documentTypeList.collection.select(item);
        }
    };
};

SW.documentTypeEditor = function () {

    SW.vm.ViewModel.call(this, { typeName: "DocumentTypeEditor" });

    var _self = this;

    this.documentType = ko.observable(null);
    this.themes = ko.observableArray();



    this.register('documentTypeContext', new SW.dc.AdminContext({
        getURL: "/api/documentTypes/get/"
        , getManyURL: "/api/documentTypes/many/"
        , geAllURL: "/api/documentTypes/all/"
        , createURL: "/api/documentTypes/new/"
        , updateURL: "/api/documentTypes/update/"
        , deleteURL: "/api/documentTypes/delete/"
    }));

    this.register('includeManager', new SW.vm.dataItemManager(_self.documentType, {
        containerAccessor: 'includes'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/includes/get/"
            , getManyURL: "/api/includes/many/"
            , geAllURL: "/api/includes/all/"
            , createURL: "/api/includes/new/"
            , updateURL: "/api/includes/update/"
        , deleteURL: "/api/includes/delete/"
            , pageURL: "/api/includes/page/"
        })
        , idleView: 'docincludeidle'
        , itemView: 'docincludeitem'
        , dbView: 'docincludelist'

        , addAssociationUrl: "/api/documentTypes/AddIncludeToDocumentType/"
        , removeAssociationUrl: "/api/documentTypes/RemoveIncludeFromDocumentType/"
    }));

    this.register('parameterTypeManager', new SW.vm.dataItemManager(_self.documentType, {
        containerAccessor: 'parameters'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/parameterTypes/get/"
            , getManyURL: "/api/parameterTypes/many/"
            , geAllURL: "/api/parameterTypes/all/"
            , createURL: "/api/parameterTypes/new/"
            , updateURL: "/api/parameterTypes/update/"
            , deleteURL: "/api/parameterTypes/delete/"
            , pageURL: "/api/parameterTypes/page/"
        })
        , idleView: 'docparameteridle'
        , itemView: 'docparameteritem'
        , dbView: 'docparameterlist'

        , addAssociationUrl: "/api/documentTypes/AddParameterTypeToDocumentType/"
        , removeAssociationUrl: "/api/documentTypes/RemoveParameterTypeFromDocumentType/"
        , onConfigureItem: configureParameterType
    }));

    this.register('sectionTypeManager', new SW.vm.dataItemManager(_self.documentType, {
        containerAccessor: 'sections'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/sectionTypes/get/"
            , getManyURL: "/api/sectionTypes/many/"
            , geAllURL: "/api/sectionTypes/all/"
            , createURL: "/api/sectionTypes/new/"
            , updateURL: "/api/sectionTypes/update/"
            , deleteURL: "/api/sectionTypes/delete/"
            , pageURL: "/api/sectionTypes/page/"
        })
        , idleView: 'docsectionidle'
        , itemView: 'docsectionitem'
        , dbView: 'docsectionlist'

        , addAssociationUrl: "/api/documentTypes/AddSectionTypeToDocumentType/"
        , removeAssociationUrl: "/api/documentTypes/RemoveSectionTypeFromDocumentType/"
        , onConfigureItem: configureSectionType
    }));


    this.register('parameterManager', new SW.vm.dataItemManager(_self.documentType, {
        containerAccessor: 'parameterReferences'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/parameters/get/"
            , getManyURL: "/api/parameters/many/"
            , geAllURL: "/api/parameters/all/"
            , createURL: "/api/parameters/new/"
            , updateURL: "/api/parameters/update/"
            , deleteURL: "/api/parameters/delete/"
            , pageURL: "/api/parameters/page/"
        })
        , idleView: 'sectionparameteridle'
        , itemView: 'sectionparameteritem'
        , dbView: 'sectionparameterlist'

        , addAssociationUrl: "/api/documentTypes/AddParameterToDocumentType/"
        , removeAssociationUrl: "/api/documentTypes/RemoveParameterFromDocumentType/"
        , onConfigureItem: configureParameter
    }));

    this.register('sectionManager', new SW.vm.dataItemManager(_self.documentType, {
        containerAccessor: 'sectionReferences'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/sections/get/"
            , getManyURL: "/api/sections/many/"
            , geAllURL: "/api/sections/all/"
            , createURL: "/api/sections/new/"
            , updateURL: "/api/sections/update/"
            , deleteURL: "/api/sections/delete/"
            , pageURL: "/api/sections/page/"
        })
        , idleView: 'sectionsectionidle'
        , itemView: 'sectionsectionitem'
        , dbView: 'sectionsectionlist'

        , addAssociationUrl: "/api/documentTypes/AddSectionToDocumentType/"
        , removeAssociationUrl: "/api/documentTypes/RemoveSectionFromDocumentType/"
        , onConfigureItem: configureSection
    }));
    this.register('tagGroupManager', new SW.vm.dataItemManager(_self.documentType, {
        containerAccessor: 'tagGroups'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/taggroups/get/"
            , getManyURL: "/api/taggroups/many/"
            , geAllURL: "/api/taggroups/all/"
            , createURL: "/api/taggroups/new/"
            , updateURL: "/api/taggroups/update/"
            , deleteURL: "/api/taggroups/delete/"
            , pageURL: "/api/taggroups/page/"
        })
        , idleView: 'doctaggroupidle'
        , itemView: 'doctaggroupitem'
        , dbView: 'doctaggrouplist'

        , addAssociationUrl: "/api/documentTypes/AddTagGroupToDocumentType/"
        , removeAssociationUrl: "/api/documentTypes/RemoveTagGroupFromDocumentType/"
    }));

    this.register('tagManager', new SW.vm.dataItemManager(_self.documentType, {
        containerAccessor: 'tags'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/tags/get/"
            , getManyURL: "/api/tags/many/"
            , geAllURL: "/api/tags/all/"
            , createURL: "/api/tags/new/"
            , updateURL: "/api/tags/update/"
            , deleteURL: "/api/tags/delete/"
            , pageURL: "/api/tags/page/"
        })
        , idleView: 'doctagidle'
        , itemView: 'doctagitem'
        , dbView: 'doctaglist'

        , addAssociationUrl: "/api/documentTypes/AddTagToDocumentType/"
        , removeAssociationUrl: "/api/documentTypes/RemoveTagFromDocumentType/"
    }));

    this.register('themeContext', new SW.dc.AdminContext({
        getURL: "/api/themes/get/"
        , getManyURL: "/api/themes/many/"
        , geAllURL: "/api/themes/all/"
        , createURL: "/api/themes/new/"
        , updateURL: "/api/themes/update/"
        , deleteURL: "/api/themes/delete/"
    }));

    this.updateDocumentType = ko.asyncCommand({

        execute: function (complete) {
            var doc = ko.mapping.toJSON(_self.documentType());


            _self.documentTypeContext.update(doc, function () {

                if (SW.util.isFunction(complete)) {
                    complete();
                }

            });
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.getDocumentType = function (id, complete) {

        _self.documentTypeContext.get(id, function (data) {

            var item = ko.mapping.fromJS(data, {});

            SW.vm.ViewModel.call(item, { typeName: "DocumentType" });
            if (!item.responseHeaders) {
                item.responseHeaders = ko.observableArray();
            }
            if (!item.includes) {
                item.includes = ko.observableArray();
            }
            if (!item.parameters) {
                item.parameters = ko.observableArray();
            }
            if (!item.sections) {
                item.sections = ko.observableArray();
            }
            if (!item.tagGroups) {
                item.tagGroups = ko.observableArray();
            }
            if (!item.tags) {
                item.tags = ko.observableArray();
            }
            _self.documentType(item);

            if (SW.util.isFunction(complete)) {
                complete();
            }
        });
        getThemes();
    };

    this.returnToSite = ko.asyncCommand({

        execute: function (complete) {

            var url = SW.sess.deQueueLocation();

            if (SW.util.wasSameDomain(url)) {
                window.location = url;
            } else {
                var documentType = _self.documentType();
                if (documentType != null) {
                    window.location = "/CAMS/admin/sitestructure/" + documentType.siteId();
                }
            }
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.currentLang = ko.computed({
        read: function () {

            var result = 'javascript';
            if (_self.documentType()) {
                if (_self.documentType().onConverted() != null) {
                  
                    if (_self.documentType().language) {
                        var lang = _self.documentType().language();
                        switch (lang) {
                            case "CS":
                                result = 'csharp';
                                break;
                            case "JS":
                                result = 'javascript';
                                break;
                            case "PY":
                                result = 'python';
                                break;
                            case "RB":
                                result = 'ruby';
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
            return result;
        }
    });

    function getThemes() {
        _self.themeContext.getAll(function (data) {
            ko.mapping.fromJS(data, {}, _self.themes);
        });
    }

    function configureSectionType() {
        var item = SW.util.propVal(_self.sectionTypeManager.currentItem);
        if (item) {
            window.location = "/CAMS/admin/editsectionType/" + SW.util.propVal(item.id);
        }
    }

    function configureParameterType() {
        var item = SW.util.propVal(_self.parameterTypeManager.currentItem);
        if (item) {
            window.location = "/CAMS/admin/editparameterType/" + SW.util.propVal(item.id);
        }
    }
    function configureSection() {
        var item = SW.util.propVal(_self.sectionManager.currentItem);
        if (item) {
            window.location = "/CAMS/admin/editsection/" + SW.util.propVal(item.id);
        }
    }

    function configureParameter() {
        var item = SW.util.propVal(_self.parameterManager.currentItem);
        if (item) {
            window.location = "/CAMS/admin/editparameter/" + SW.util.propVal(item.id);
        }
    }
};

SW.documentTypeCollection = function () {

    var documentTypeContext = new SW.dc.PagingAdminContext({
        getURL: "/api/documentTypes/get/"
        , getManyURL: "/api/documentTypes/many/"
        , geAllURL: "/api/documentTypes/all/"
        , createURL: "/api/documentTypes/new/"
        , updateURL: "/api/documentTypes/update/"
        , deleteURL: "/api/documentTypes/delete/"
        , pageURL: "/api/documentTypes/page/"
    });

    SW.vm.ViewModel.call(this, { typeName: "DocumentTypeCollection" });

    SW.vm.collections.data.PagingAdminCollection.call(this, {
        dataContext: documentTypeContext, sortField: "name",
        collection: new SW.vm.collections.viewModelSelectableCollectionBase(),
        onCreate: function (item) {

            SW.vm.ViewModel.call(item, { typeName: "DocumentType" });
        }
    });

};

//#endregion


//#region SectionTypes
SW.sectionTypeAdmin = function () {

    //Inherit from ViewModelBase
    var _self = this;
    SW.vm.ViewModel.call(this, { typeName: "SectionTypeAdmin" });

    this.register('sectionTypeList', new SW.sectionTypeCollection());

    this.showDetailCommands = ko.observable(false);


    this.sectionTypeList.collection.onSelected = function (item) {

        SW.sess.item('SectionTypeManager').setRootVM(item);
        _self.showDetailCommands(true);

    };
    this.sectionTypeList.collection.onDeselected = function () {
        var item = SW.sess.item('SectionTypeManager').data('sectionTypeAdmin').sectionTypeList;

        SW.sess.item('SectionTypeManager').setRootVM(item);
        _self.showDetailCommands(false);

    };
    this.sectionTypeList.onRemoved = function () {
        this.collection.deselect();
    };
    this.sectionTypeList.onUpdated = function () {
        this.collection.deselect();
    };
    this.sectionTypeList.onCreated = function (item) {
        this.collection.select(item);
    };


    this.createSectionType = ko.asyncCommand({

        execute: function (complete) {
            _self.sectionTypeList.create(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.removeSectionType = ko.asyncCommand({

        execute: function (complete) {
            _self.sectionTypeList.remove(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });


    this.editSectionType = ko.asyncCommand({

        execute: function (complete) {

            var item = SW.util.propVal(_self.sectionTypeList.collection.currentItem);
            if (item) {
                window.location = "/CAMS/admin/editsectionType/" + SW.util.propVal(item.id);
            }
            complete();
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.select = function (item) {
        if (_self.sectionTypeList.collection.currentItem() === item) {
            _self.sectionTypeList.collection.deselect();
        } else {
            _self.sectionTypeList.collection.select(item);
        }
    };
};

SW.sectionTypeEditor = function () {

    SW.vm.ViewModel.call(this, { typeName: "SectionTypeEditor" });

    var _self = this;

    this.sectionType = ko.observable(null);
    this.themes = ko.observableArray();



    this.register('sectionTypeContext', new SW.dc.AdminContext({
        getURL: "/api/sectionTypes/get/"
        , getManyURL: "/api/sectionTypes/many/"
        , geAllURL: "/api/sectionTypes/all/"
        , createURL: "/api/sectionTypes/new/"
        , updateURL: "/api/sectionTypes/update/"
        , deleteURL: "/api/sectionTypes/delete/"
    }));

    this.register('includeManager', new SW.vm.dataItemManager(_self.sectionType, {
        containerAccessor: 'includes'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/includes/get/"
            , getManyURL: "/api/includes/many/"
            , geAllURL: "/api/includes/all/"
            , createURL: "/api/includes/new/"
            , updateURL: "/api/includes/update/"
        , deleteURL: "/api/includes/delete/"
            , pageURL: "/api/includes/page/"
        })
        , idleView: 'sectionincludeidle'
        , itemView: 'sectionincludeitem'
        , dbView: 'sectionincludelist'

        , addAssociationUrl: "/api/sectionTypes/AddIncludeToSectionType/"
        , removeAssociationUrl: "/api/sectionTypes/RemoveIncludeFromSectionType/"
    }));

    this.register('parameterTypeManager', new SW.vm.dataItemManager(_self.sectionType, {
        containerAccessor: 'parameters'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/parameterTypes/get/"
            , getManyURL: "/api/parameterTypes/many/"
            , geAllURL: "/api/parameterTypes/all/"
            , createURL: "/api/parameterTypes/new/"
            , updateURL: "/api/parameterTypes/update/"
            , deleteURL: "/api/parameterTypes/delete/"
            , pageURL: "/api/parameterTypes/page/"
        })
        , idleView: 'sectionparameteridle'
        , itemView: 'sectionparameteritem'
        , dbView: 'sectionparameterlist'

        , addAssociationUrl: "/api/sectionTypes/AddParameterTypeToSectionType/"
        , removeAssociationUrl: "/api/sectionTypes/RemoveParameterTypeFromSectionType/"
        , onConfigureItem: configureParameterType
    }));

    this.register('sectionTypeManager', new SW.vm.dataItemManager(_self.sectionType, {
        containerAccessor: 'childSections'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/sectionTypes/get/"
            , getManyURL: "/api/sectionTypes/many/"
            , geAllURL: "/api/sectionTypes/all/"
            , createURL: "/api/sectionTypes/new/"
            , updateURL: "/api/sectionTypes/update/"
            , deleteURL: "/api/sectionTypes/delete/"
            , pageURL: "/api/sectionTypes/page/"
        })
        , idleView: 'sectionsectionidle'
        , itemView: 'sectionsectionitem'
        , dbView: 'sectionsectionlist'

        , addAssociationUrl: "/api/sectionTypes/AddSectionTypeToSectionType/"
        , removeAssociationUrl: "/api/sectionTypes/RemoveSectionTypeFromSectionType/"
        , onConfigureItem: configureSectionType
    }));

    this.register('parameterManager', new SW.vm.dataItemManager(_self.sectionType, {
        containerAccessor: 'parameterReferences'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/parameters/get/"
            , getManyURL: "/api/parameters/many/"
            , geAllURL: "/api/parameters/all/"
            , createURL: "/api/parameters/new/"
            , updateURL: "/api/parameters/update/"
            , deleteURL: "/api/parameters/delete/"
            , pageURL: "/api/parameters/page/"
        })
        , idleView: 'sectionparameteridle'
        , itemView: 'sectionparameteritem'
        , dbView: 'sectionparameterlist'

        , addAssociationUrl: "/api/sectionTypes/AddParameterToSectionType/"
        , removeAssociationUrl: "/api/sectionTypes/RemoveParameterFromSectionType/"
        , onConfigureItem: configureParameter
    }));

    this.register('sectionManager', new SW.vm.dataItemManager(_self.sectionType, {
        containerAccessor: 'sectionReferences'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/sections/get/"
            , getManyURL: "/api/sections/many/"
            , geAllURL: "/api/sections/all/"
            , createURL: "/api/sections/new/"
            , updateURL: "/api/sections/update/"
            , deleteURL: "/api/sections/delete/"
            , pageURL: "/api/sections/page/"
        })
        , idleView: 'sectionsectionidle'
        , itemView: 'sectionsectionitem'
        , dbView: 'sectionsectionlist'

        , addAssociationUrl: "/api/sectionTypes/AddSectionToSectionType/"
        , removeAssociationUrl: "/api/sectionTypes/RemoveSectionFromSectionType/"
        , onConfigureItem: configureSection
    }));

    this.register('tagGroupManager', new SW.vm.dataItemManager(_self.sectionType, {
        containerAccessor: 'tagGroups'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/taggroups/get/"
            , getManyURL: "/api/taggroups/many/"
            , geAllURL: "/api/taggroups/all/"
            , createURL: "/api/taggroups/new/"
            , updateURL: "/api/taggroups/update/"
            , deleteURL: "/api/taggroups/delete/"
            , pageURL: "/api/taggroups/page/"
        })
        , idleView: 'sectiontaggroupidle'
        , itemView: 'sectiontaggroupitem'
        , dbView: 'sectiontaggrouplist'

        , addAssociationUrl: "/api/sectionTypes/AddTagGroupToSectionType/"
        , removeAssociationUrl: "/api/sectionTypes/RemoveTagGroupFromSectionType/"
    }));

    this.register('tagManager', new SW.vm.dataItemManager(_self.sectionType, {
        containerAccessor: 'tags'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/tags/get/"
            , getManyURL: "/api/tags/many/"
            , geAllURL: "/api/tags/all/"
            , createURL: "/api/tags/new/"
            , updateURL: "/api/tags/update/"
            , deleteURL: "/api/tags/delete/"
            , pageURL: "/api/tags/page/"
        })
        , idleView: 'sectiontagidle'
        , itemView: 'sectiontagitem'
        , dbView: 'sectiontaglist'

        , addAssociationUrl: "/api/sectionTypes/AddTagToSectionType/"
        , removeAssociationUrl: "/api/sectionTypes/RemoveTagFromSectionType/"
    }));

    this.register('themeContext', new SW.dc.AdminContext({
        getURL: "/api/themes/get/"
    , getManyURL: "/api/themes/many/"
    , geAllURL: "/api/themes/all/"
    , createURL: "/api/themes/new/"
    , updateURL: "/api/themes/update/"
    , deleteURL: "/api/themes/delete/"
    }));

    this.updateSectionType = ko.asyncCommand({

        execute: function (complete) {
            var doc = ko.mapping.toJSON(_self.sectionType());


            _self.sectionTypeContext.update(doc, function () {

                if (SW.util.isFunction(complete)) {
                    complete();
                }

            });
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.getSectionType = function (id, complete) {

        _self.sectionTypeContext.get(id, function (data) {

            var item = ko.mapping.fromJS(data, {});

            SW.vm.ViewModel.call(item, { typeName: "SectionType" });

            if (!item.includes) {
                item.includes = ko.observableArray();
            }
            if (!item.parameters) {
                item.parameters = ko.observableArray();
            }
            if (!item.childSections) {
                item.childSections = ko.observableArray();
            }
            if (!item.tagGroups) {
                item.tagGroups = ko.observableArray();
            }
            if (!item.tags) {
                item.tags = ko.observableArray();
            }
            _self.sectionType(item);

            if (SW.util.isFunction(complete)) {
                complete();
            }
        });
        getThemes();
    };

    this.returnToSite = ko.asyncCommand({

        execute: function (complete) {

            var url = SW.sess.deQueueLocation();

            if (SW.util.wasSameDomain(url)) {
                window.location = url;
            } else {
                var sectionType = _self.sectionType();
                if (sectionType != null) {
                    window.location = "/CAMS/admin/sitestructure/" + sectionType.site().id();
                }
            }
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });


    this.currentLang = ko.computed({
        read: function () {

            var result = 'javascript';
            if (_self.sectionType()) {
                if (_self.sectionType().onConverted() != null) {

                    if (_self.sectionType().language) {
                        var lang = _self.sectionType().language();
                        switch (lang) {
                            case "CS":
                                result = 'csharp';
                                break;
                            case "JS":
                                result = 'javascript';
                                break;
                            case "PY":
                                result = 'python';
                                break;
                            case "RB":
                                result = 'ruby';
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
            return result;
        }
    });

    function getThemes() {
        _self.themeContext.getAll(function (data) {
            ko.mapping.fromJS(data, {}, _self.themes);
        });
    }

    function configureSectionType() {
        var item = SW.util.propVal(_self.sectionTypeManager.currentItem);
        if (item) {
            window.location = "/CAMS/admin/editsectionType/" + SW.util.propVal(item.id);
        }
    }

    function configureParameterType() {
        var item = SW.util.propVal(_self.parameterTypeManager.currentItem);
        if (item) {
            window.location = "/CAMS/admin/editparameterType/" + SW.util.propVal(item.id);
        }
    }

    function configureSection() {
        var item = SW.util.propVal(_self.sectionManager.currentItem);
        if (item) {
            window.location = "/CAMS/admin/editsection/" + SW.util.propVal(item.id);
        }
    }

    function configureParameter() {
        var item = SW.util.propVal(_self.parameterManager.currentItem);
        if (item) {
            window.location = "/CAMS/admin/editparameter/" + SW.util.propVal(item.id);
        }
    }
};

SW.sectionTypeCollection = function () {

    var sectionTypeContext = new SW.dc.PagingAdminContext({
        getURL: "/api/sectionTypes/get/"
        , getManyURL: "/api/sectionTypes/many/"
        , geAllURL: "/api/sectionTypes/all/"
        , createURL: "/api/sectionTypes/new/"
        , updateURL: "/api/sectionTypes/update/"
        , deleteURL: "/api/sectionTypes/delete/"
        , pageURL: "/api/sectionTypes/page/"
    });

    SW.vm.ViewModel.call(this, { typeName: "SectionTypeCollection" });

    SW.vm.collections.data.PagingAdminCollection.call(this, {
        dataContext: sectionTypeContext, sortField: "name",
        collection: new SW.vm.collections.viewModelSelectableCollectionBase(),
        onCreate: function (item) {

            SW.vm.ViewModel.call(item, { typeName: "SectionType" });
        }
    });

};

//#endregion


//#region ParameterTypes

SW.parameterTypeAdmin = function () {

    //Inherit from ViewModelBase
    var _self = this;
    SW.vm.ViewModel.call(this, { typeName: "ParameterTypeAdmin" });

    this.register('parameterTypeList', new SW.parameterTypeCollection());

    this.showDetailCommands = ko.observable(false);


    this.parameterTypeList.collection.onSelected = function (item) {

        SW.sess.item('ParameterTypeManager').setRootVM(item);
        _self.showDetailCommands(true);

    };
    this.parameterTypeList.collection.onDeselected = function () {
        var item = SW.sess.item('ParameterTypeManager').data('parameterTypeAdmin').parameterTypeList;

        SW.sess.item('ParameterTypeManager').setRootVM(item);
        _self.showDetailCommands(false);

    };
    this.parameterTypeList.onRemoved = function () {
        this.collection.deselect();
    };
    this.parameterTypeList.onUpdated = function () {
        this.collection.deselect();
    };
    this.parameterTypeList.onCreated = function (item) {
        this.collection.select(item);
    };


    this.createParameterType = ko.asyncCommand({

        execute: function (complete) {
            _self.parameterTypeList.create(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.removeParameterType = ko.asyncCommand({

        execute: function (complete) {
            _self.parameterTypeList.remove(null, complete);
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });


    this.editParameterType = ko.asyncCommand({

        execute: function (complete) {

            var item = SW.util.propVal(_self.parameterTypeList.collection.currentItem);
            if (item) {
                window.location = "/CAMS/admin/editparameterType/" + SW.util.propVal(item.id);
            }
            complete();
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.select = function (item) {
        if (_self.parameterTypeList.collection.currentItem() === item) {
            _self.parameterTypeList.collection.deselect();
        } else {
            _self.parameterTypeList.collection.select(item);
        }
    };
};

SW.parameterTypeEditor = function () {

    SW.vm.ViewModel.call(this, { typeName: "ParameterTypeEditor" });

    var _self = this;

    this.parameterType = ko.observable(null);


    this.register('parameterTypeContext', new SW.dc.AdminContext({
        getURL: "/api/parameterTypes/get/"
        , getManyURL: "/api/parameterTypes/many/"
        , geAllURL: "/api/parameterTypes/all/"
        , createURL: "/api/parameterTypes/new/"
        , updateURL: "/api/parameterTypes/update/"
        , deleteURL: "/api/parameterTypes/delete/"
    }));

    this.register('tagGroupManager', new SW.vm.dataItemManager(_self.parameterType, {
        containerAccessor: 'tagGroups'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/taggroups/get/"
            , getManyURL: "/api/taggroups/many/"
            , geAllURL: "/api/taggroups/all/"
            , createURL: "/api/taggroups/new/"
            , updateURL: "/api/taggroups/update/"
            , deleteURL: "/api/taggroups/delete/"
            , pageURL: "/api/taggroups/page/"
        })
        , idleView: 'parametertaggroupidle'
        , itemView: 'parametertaggroupitem'
        , dbView: 'parametertaggrouplist'

        , addAssociationUrl: "/api/parameterTypes/AddTagGroupToParameterType/"
        , removeAssociationUrl: "/api/parameterTypes/RemoveTagGroupFromParameterType/"
    }));

    this.register('tagManager', new SW.vm.dataItemManager(_self.parameterType, {
        containerAccessor: 'tags'
        , context: new SW.dc.PagingAdminContext({
            getURL: "/api/tags/get/"
            , getManyURL: "/api/tags/many/"
            , geAllURL: "/api/tags/all/"
            , createURL: "/api/tags/new/"
            , updateURL: "/api/tags/update/"
            , deleteURL: "/api/tags/delete/"
            , pageURL: "/api/tags/page/"
        })
        , idleView: 'parametertagidle'
        , itemView: 'parametertagitem'
        , dbView: 'parametertaglist'

        , addAssociationUrl: "/api/parameterTypes/AddTagToParameterType/"
        , removeAssociationUrl: "/api/parameterTypes/RemoveTagFromParameterType/"
    }));

    this.updateParameterType = ko.asyncCommand({

        execute: function (complete) {
            var doc = ko.mapping.toJSON(_self.parameterType());


            _self.parameterTypeContext.update(doc, function () {

                if (SW.util.isFunction(complete)) {
                    complete();
                }

            });
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

    this.getParameterType = function (id, complete) {

        _self.parameterTypeContext.get(id, function (data) {

            var item = ko.mapping.fromJS(data, {});

            SW.vm.ViewModel.call(item, { typeName: "ParameterType" });

            if (!item.tagGroups) {
                item.tagGroups = ko.observableArray();
            }
            if (!item.tags) {
                item.tags = ko.observableArray();
            }
            _self.parameterType(item);

            if (SW.util.isFunction(complete)) {
                complete();
            }
        });
    };

    this.returnToSite = ko.asyncCommand({

        execute: function (complete) {


            var url = SW.sess.deQueueLocation();

            if (SW.util.wasSameDomain(url)) {
                window.location = url;
            } else {
                var parameterType = _self.parameterType();
                if (parameterType != null) {
                    window.location = "/CAMS/admin/sitestructure/" + parameterType.site().id();
                }
            }
        },
        canExecute: function (isExecuting) {
            return !isExecuting;
        }
    });

};

SW.parameterTypeCollection = function () {

    var parameterTypeContext = new SW.dc.PagingAdminContext({
        getURL: "/api/parameterTypes/get/"
        , getManyURL: "/api/parameterTypes/many/"
        , geAllURL: "/api/parameterTypes/all/"
        , createURL: "/api/parameterTypes/new/"
        , updateURL: "/api/parameterTypes/update/"
        , deleteURL: "/api/parameterTypes/delete/"
        , pageURL: "/api/parameterTypes/page/"
    });

    SW.vm.ViewModel.call(this, { typeName: "ParameterTypeCollection" });

    SW.vm.collections.data.PagingAdminCollection.call(this, {
        dataContext: parameterTypeContext, sortField: "name",
        collection: new SW.vm.collections.viewModelSelectableCollectionBase(),
        onCreate: function (item) {

            SW.vm.ViewModel.call(item, { typeName: "ParameterType" });
        }
    });

};

//#endregion

//#region Assets

SW.assetManager = function () {

    SW.vm.ViewModel.call(this, { typeName: "AssetManager" });
    var _self = this;
    var _getFoldersUrl = "/api/assetReferences/getfolderstructure";
    var _getFileUrl = "/api/assetReferences/getfiles/";

    this.register('assetReferenceList', new SW.assetReferenceCollection());

    this.rootFolder = ko.observable(null);
    this.currentFolder = ko.observable(null);
    this.currentFile = ko.observable(null);
    this.fileList = ko.observableArray();

    this.getRoot = function(){
        _self.assetReferenceList.getFrom(_getFoldersUrl, function (data) {
            _self.rootFolder(data);
        });
    };

    this.selectFolder = function (item) {
        
        var selection = SW.util.propVal(item);
        _self.currentFolder(selection);
        getFiles(selection);

    };
    this.selectFile = function (item) {
        var file = _self.currentFile();
        var selection = SW.util.propVal(item);
        if (file) {

            if (file == selection) {
                _self.currentFile(null);
            } else {
                _self.currentFile(selection);
            }
        } else {
            _self.currentFile(selection);
        }
    };

    function getFiles(folder) {

        var payload = ko.mapping.toJSON(folder);
        _self.assetReferenceList.getFrom(_getFileUrl, function (data) {
            _self.fileList.removeAll();
            ko.utils.arrayForEach(data(), function (item) {
                _self.fileList.push(item);
            });
        }, payload);
    }
    _self.getRoot(); 
};

SW.assetReferenceCollection = function () {

    var sectionTypeContext = new SW.dc.PagingAdminContext({
        getURL: "/api/assetReferences/get/"
        , getManyURL: "/api/assetReferences/many/"
        , geAllURL: "/api/assetReferences/all/"
        , createURL: "/api/assetReferences/new/"
        , updateURL: "/api/assetReferences/update/"
        , deleteURL: "/api/assetReferences/delete/"
        , pageURL: "/api/assetReferences/page/"
    });

    SW.vm.ViewModel.call(this, { typeName: "AssetReferencesCollection" });

    SW.vm.collections.data.PagingAdminCollection.call(this, {
        dataContext: sectionTypeContext, sortField: "name",
        collection: new SW.vm.collections.viewModelSelectableCollectionBase(),
        onCreate: function (item) {

            SW.vm.ViewModel.call(item, { typeName: "AssetReference" });
        }
    });

};

//#endregion


//#region Common
SW.applyDocumentTemplateData = function () {

    var _self = this;
    SW.vm.ViewModel.call(this, { typeName: "ApplyDocumentTemplateData" });

    this.documentId =  ko.observable(0);
    this.documentTypeId = ko.observable(0);
    this.clearAll = ko.observable(false);
    this.applyGeneral = ko.observable(false);
    this.applyIncludes = ko.observable(false);
    this.mergeIncludes = ko.observable(false);
    this.applyParameters = ko.observable(false);
    this.mergeParameters = ko.observable(false);
    this.applySections = ko.observable(false);
    this.mergeSections = ko.observable(false);
    this.applyTagGroups = ko.observable(false);
    this.mergeTagGroups = ko.observable(false);
    this.applyTags = ko.observable(false);
    this.mergeTags = ko.observable(false);

 
    
    this.areAllChecked = ko.computed({read: function () {
        return
        (_self.clearAll() &&
        _self.applyGeneral() &&
        _self.applyIncludes() &&
        _self.mergeIncludes() &&
        _self.applyParameters() &&
        _self.mergeParameters() &&
        _self.applySections() &&
        _self.mergeSections() &&
        _self.applyTagGroups() &&
        _self.mergeTagGroups() &&
        _self.applyTags() &&
        _self.mergeTags());
    }
    });

    this.groupActionText = ko.computed({
        read: function () {
            return _self.areAllChecked() ? "Un-Check All" : "Check All";
        }
    });

    this.performGroupAction = function () {
        if (_self.areAllChecked()) {
            _self.unCheckAll();
        } else {
            _self.checkAll();
        }
    }

    this.checkAll = function () {
        _self.clearAll(true);
        _self.applyGeneral(true);
        _self.applyIncludes(true);
        _self.mergeIncludes(true);
        _self.applyParameters(true);
        _self.mergeParameters(true);
        _self.applySections(true);
        _self.mergeSections(true);
        _self.applyTagGroups(true);
        _self.mergeTagGroups(true);
        _self.applyTags(true);
        _self.mergeTags(true);
    };
    this.unCheckAll = function () {
        _self.clearAll(false);
        _self.applyGeneral(false);
        _self.applyIncludes(false);
        _self.mergeIncludes(false);
        _self.applyParameters(false);
        _self.mergeParameters(false);
        _self.applySections(false);
        _self.mergeSections(false);
        _self.applyTagGroups(false);
        _self.mergeTagGroups(false);
        _self.applyTags(false);
        _self.mergeTags(false);
    };

};

SW.applySectionTemplateData = function () {

    var _self = this;
    SW.vm.ViewModel.call(this, { typeName: "ApplySectionTemplateData" });

    this.sectionId = ko.observable(0);
    this.sectionTypeId = ko.observable(0);
    this.clearAll = ko.observable(false);
    this.applyGeneral = ko.observable(false);
    this.applyIncludes = ko.observable(false);
    this.mergeIncludes = ko.observable(false);
    this.applyParameters = ko.observable(false);
    this.mergeParameters = ko.observable(false);
    this.applySections = ko.observable(false);
    this.mergeSections = ko.observable(false);
    this.applyTagGroups = ko.observable(false);
    this.mergeTagGroups = ko.observable(false);
    this.applyTags = ko.observable(false);
    this.mergeTags = ko.observable(false);
    


    this.areAllChecked = ko.computed({
        read: function () {
            return
            (_self.clearAll() &&
            _self.applyGeneral() &&
            _self.applyIncludes() &&
            _self.mergeIncludes() &&
            _self.applyParameters() &&
            _self.mergeParameters() &&
            _self.applySections() &&
            _self.mergeSections() &&
            _self.applyTagGroups() &&
            _self.mergeTagGroups() &&
            _self.applyTags() &&
            _self.mergeTags());
        }, owner: _self
    });

    this.groupActionText = ko.computed({
        read: function () {
            return _self.areAllChecked() ? "Un-Check All" : "Check All";
        }, owner: _self
    });

    this.performGroupAction = function () {
        if (_self.areAllChecked()) {
            _self.unCheckAll();
        } else {
            _self.checkAll();
        }
    }

    this.checkAll = function () {
        _self.clearAll(true);
        _self.applyGeneral(true);
        _self.applyIncludes(true);
        _self.mergeIncludes(true);
        _self.applyParameters(true);
        _self.mergeParameters(true);
        _self.applySections(true);
        _self.mergeSections(true);
        _self.applyTagGroups(true);
        _self.mergeTagGroups(true);
        _self.applyTags(true);
        _self.mergeTags(true);
    };
    this.unCheckAll = function () {
        _self.clearAll(false);
        _self.applyGeneral(false);
        _self.applyIncludes(false);
        _self.mergeIncludes(false);
        _self.applyParameters(false);
        _self.mergeParameters(false);
        _self.applySections(false);
        _self.mergeSections(false);
        _self.applyTagGroups(false);
        _self.mergeTagGroups(false);
        _self.applyTags(false);
        _self.mergeTags(false);
    };

};

SW.applyParameterTemplateData = function () {

    var _self = this;
    SW.vm.ViewModel.call(this, { typeName: "ApplyParameterTemplateData" });

    this.parameterId = ko.observable(0);
    this.parameterTypeId = ko.observable(0);
    this.clearAll = ko.observable(false);
    this.applyGeneral = ko.observable(false);
    this.applyContent = ko.observable(false);
    this.applyTagGroups = ko.observable(false);
    this.mergeTagGroups = ko.observable(false);
    this.applyTags = ko.observable(false);
    this.mergeTags = ko.observable(false);

    this.areAllChecked = ko.computed({
        read: function () {
            return
            (_self.clearAll() &&
            _self.applyGeneral() &&
            _self.applyContent() &&
            _self.applyTagGroups() &&
            _self.mergeTagGroups() &&
            _self.applyTags() &&
            _self.mergeTags());
        }, owner: this
    });
    
    this.groupActionText = ko.computed(function () {
        return _self.areAllChecked() ? "Un-Check All" : "Check All";
    }, this);

    this.performGroupAction = function () {
        if (_self.areAllChecked()) {
            _self.unCheckAll();
        } else {
            _self.checkAll();
        }
    }

    this.checkAll = function () {
        _self.clearAll(true);
        _self.applyGeneral(true);
        _self.applyContent(true);
        _self.applyTagGroups(true);
        _self.mergeTagGroups(true);
        _self.applyTags(true);
        _self.mergeTags(true);
    };
    this.unCheckAll = function () {
        _self.clearAll(false);
        _self.applyGeneral(false);
        _self.applyContent(false);
        _self.applyTagGroups(false);
        _self.mergeTagGroups(false);
        _self.applyTags(false);
        _self.mergeTags(false);
    };
};

//#endregion
//#endregion