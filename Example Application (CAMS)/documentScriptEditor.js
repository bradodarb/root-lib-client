
SW.sess = new SW.app.Session({
    domReady: function () {
        infuser.defaults.templateUrl = '/CAMS/admin/Templates/KnockoutTemplate';
        infuser.defaults.templatePrefix = '_';
        infuser.defaults.templateSuffix = '';
        ko.applyBindings(this.current);
        this.queueLocation();
    }
});

var app_documentScriptEditor = new SW.app.Application({

    appName: "documentScriptManager"

	, initV: function () {
	    var vp1 = new SW.v.ViewProvider({ viewContext: "default" });
	    vp1.register("DocumentScript", "DocumentScriptStructure");
	    this.V.register(vp1);
	}
	, initVM: function () {
	    var vm = new SW.documentScriptEditor();
	    this.VM.register("documentScriptEditor", vm);
	    this.setRootVM(vm);


	    var href = window.location.href;
	    var id = href.substr(href.lastIndexOf('/') + 1)
	    vm.getDocumentScript(id);
	}

});

///Register Applications
SW.sess.register(app_documentScriptEditor);



///Initialize the settings (this will be moved to page level script to init in context)
SW.sess.init();
SW.sess.select("documentScriptManager");