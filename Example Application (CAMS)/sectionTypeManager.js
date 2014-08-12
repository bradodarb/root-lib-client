






SW.sess = new SW.app.Session({
    domReady: function () {
        infuser.defaults.templateUrl = '/CAMS/admin/Templates/KnockoutTemplate';
        infuser.defaults.templatePrefix = '_';
        infuser.defaults.templateSuffix = '';
        ko.applyBindings(this.current);
        this.queueLocation();
    }
});

var app_sectionTypeManager = new SW.app.Application({

    appName: "SectionTypeManager"
	, initV: function () {
	    var vp1 = new SW.v.ViewProvider({ viewContext: "default" });
		vp1.register("SectionTypeCollection", "sectionTypes");
		vp1.register("SectionType", "sectionTypeDetail");
		this.V.register(vp1);
	}
	, initVM: function () {
	    var vm = new SW.sectionTypeAdmin();
	    this.VM.register("sectionTypeAdmin", vm);
	    this.setRootVM(vm.sectionTypeList);
	    vm.sectionTypeList.getPage();
	}

});
  

///Register Applications
SW.sess.register(app_sectionTypeManager);



///Initialize the settings (this will be moved to page level script to init in context)
SW.sess.init();
SW.sess.select("SectionTypeManager");