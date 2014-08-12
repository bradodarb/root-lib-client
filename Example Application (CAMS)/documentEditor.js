
SW.sess = new SW.app.Session({
    domReady: function () {
        infuser.defaults.templateUrl = '/CAMS/admin/Templates/KnockoutTemplate';
        infuser.defaults.templatePrefix = '_';
        infuser.defaults.templateSuffix = '';
        ko.applyBindings(this.current);
        this.queueLocation();
    }
});

var app_documentEditor = new SW.app.Application({

    appName: "documentManager"

	, initV: function () {
	    var vp1 = new SW.v.ViewProvider({ viewContext: "default" });
	    vp1.register("Document", "documentStructure");
	    this.V.register(vp1);
	}
	, initVM: function () {
	    var vm = new SW.documentEditor();
	    this.VM.register("documentEditor", vm);
	    this.setRootVM(vm);


	    var href = window.location.href;
	    var id = href.substr(href.lastIndexOf('/') + 1)
	    vm.getDocument(id);
	    vm.documentTypeList.getPage();
	}

});

///Register Applications
SW.sess.register(app_documentEditor);



///Initialize the settings (this will be moved to page level script to init in context)
SW.sess.init();
SW.sess.select("documentManager");