
SW.sess = new SW.app.Session({
    domReady: function () {
        infuser.defaults.templateUrl = '/CAMS/admin/Templates/KnockoutTemplate';
        infuser.defaults.templatePrefix = '_';
        infuser.defaults.templateSuffix = '';
        ko.applyBindings(this.current);
        this.queueLocation();
    }
});

var app_sectionEditor = new SW.app.Application({

    appName: "sectionManager"

	, initV: function () {
	    var vp1 = new SW.v.ViewProvider({ viewContext: "default" });
	    vp1.register("Section", "sectionStructure");
	    this.V.register(vp1);
	}
	, initVM: function () {
	    var vm = new SW.sectionEditor();
	    this.VM.register("sectionEditor", vm);
	    this.setRootVM(vm);



	    var href = window.location.href;
	    var id = href.substr(href.lastIndexOf('/') + 1)
	    vm.getSection(id);
	    vm.sectionTypeList.getPage();
	}

});

///Register Applications
SW.sess.register(app_sectionEditor);



///Initialize the settings (this will be moved to page level script to init in context)
SW.sess.init();
SW.sess.select("sectionManager");