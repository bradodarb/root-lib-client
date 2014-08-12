






SW.sess = new SW.app.Session({
    domReady: function () {
        infuser.defaults.templateUrl = '/CAMS/admin/Templates/KnockoutTemplate';
        infuser.defaults.templatePrefix = '_';
        infuser.defaults.templateSuffix = '';
        ko.applyBindings(this.current);
        this.queueLocation();
    }
});

var app_contentTemplateManager = new SW.app.Application({

    appName: "ContentTemplateManager"
	, initV: function () {
	    var vp1 = new SW.v.ViewProvider({ viewContext: "default" });
		vp1.register("ContentTemplateCollection", "contentTemplates");
		vp1.register("ContentTemplate", "contentTemplateDetail");
		this.V.register(vp1);
	}
	, initVM: function () {
	    var vm = new SW.contentTemplateAdmin();
	    this.VM.register("contentTemplateAdmin", vm);
	    this.setRootVM(vm.contentTemplateList);
	    vm.contentTemplateList.getPage();
	}

});
  

///Register Applications
SW.sess.register(app_contentTemplateManager);



///Initialize the settings (this will be moved to page level script to init in context)
SW.sess.init();
SW.sess.select("ContentTemplateManager");