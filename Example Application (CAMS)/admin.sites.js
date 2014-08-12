ADMIN.admins.siteAdmin = {
    context: {}
};

ADMIN.factory.viewModelFactory(ADMIN.admins.siteAdmin, {
    appName: 'Site',
    itemsView: 'sites',
    detailView: 'siteDetail',
    addedMessage: 'New Site Created',
    savedMessage: 'Site Saved',
    removedMessage: 'Site Deleted',
    editOnAdd: true
});

ADMIN.factory.contextFactory(ADMIN.admins.siteAdmin.context, {
    getURL: "/api/site/get/",
    getManyURL: "/api/site/many/",
    newURL: "/api/site/new/",
    saveURL: "/api/site/update",
    deleteURL: "/api/site/delete/",
    pageURL: "/api/site/page/"
});