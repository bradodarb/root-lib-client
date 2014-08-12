






SW.sess = new SW.app.Session({
    domReady: function () {
        infuser.defaults.templateUrl = '/CAMS/admin/Templates/KnockoutTemplate';
        infuser.defaults.templatePrefix = '_';
        infuser.defaults.templateSuffix = '';
        ko.applyBindings(this.current);
        this.queueLocation();
    }
});

var app_sectionManager = new SW.app.Application({

    appName: "SectionManager"
	, initV: function () {
	    var vp1 = new SW.v.ViewProvider({ viewContext: "default" });
		vp1.register("SectionCollection", "sections");
		vp1.register("Section", "sectionDetail");
		this.V.register(vp1);
	}
	, initVM: function () {
	    var vm = new SW.sectionAdmin();
	    this.VM.register("sectionAdmin", vm);
	    this.setRootVM(vm.sectionList);
	    vm.sectionList.getPage();
	}

});
  

///Register Applications
SW.sess.register(app_sectionManager);



///Initialize the settings (this will be moved to page level script to init in context)
SW.sess.init();
SW.sess.select("SectionManager");