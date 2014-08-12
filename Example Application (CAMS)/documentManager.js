






SW.sess = new SW.app.Session({
    domReady: function () {
        infuser.defaults.templateUrl = '/CAMS/admin/Templates/KnockoutTemplate';
        infuser.defaults.templatePrefix = '_';
        infuser.defaults.templateSuffix = '';
        ko.applyBindings(this.current);
        this.queueLocation();
    }
});

var app_documentManager = new SW.app.Application({

    appName: "DocumentManager"
	, initV: function () {
	    var vp1 = new SW.v.ViewProvider({ viewContext: "default" });
		vp1.register("DocumentCollection", "documents");
		vp1.register("Document", "documentDetail");
		this.V.register(vp1);
	}
	, initVM: function () {
	    var vm = new SW.documentAdmin();
	    this.VM.register("documentAdmin", vm);
	    this.setRootVM(vm.documentList);
	    vm.documentList.getPage();
	}

});
  

///Register Applications
SW.sess.register(app_documentManager);



///Initialize the settings (this will be moved to page level script to init in context)
SW.sess.init();
SW.sess.select("DocumentManager");