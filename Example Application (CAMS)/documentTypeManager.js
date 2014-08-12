






SW.sess = new SW.app.Session({
    domReady: function () {
        infuser.defaults.templateUrl = '/CAMS/admin/Templates/KnockoutTemplate';
        infuser.defaults.templatePrefix = '_';
        infuser.defaults.templateSuffix = '';
        ko.applyBindings(this.current);
        this.queueLocation();
    }
});

var app_documentTypeManager = new SW.app.Application({

    appName: "DocumentTypeManager"
	, initV: function () {
	    var vp1 = new SW.v.ViewProvider({ viewContext: "default" });
		vp1.register("DocumentTypeCollection", "documentTypes");
		vp1.register("DocumentType", "documentTypeDetail");
		this.V.register(vp1);
	}
	, initVM: function () {
	    var vm = new SW.documentTypeAdmin();
	    this.VM.register("documentTypeAdmin", vm);
	    this.setRootVM(vm.documentTypeList);
	    vm.documentTypeList.getPage();
	}

});
  

///Register Applications
SW.sess.register(app_documentTypeManager);



///Initialize the settings (this will be moved to page level script to init in context)
SW.sess.init();
SW.sess.select("DocumentTypeManager");