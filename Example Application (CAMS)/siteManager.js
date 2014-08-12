






SW.sess = new SW.app.Session({
    domReady: function () {
        infuser.defaults.templateUrl = '/CAMS/admin/Templates/KnockoutTemplate';
        infuser.defaults.templatePrefix = '_';
        infuser.defaults.templateSuffix = '';
        ko.applyBindings(this.current);
        this.queueLocation();
    }
});

var app_siteManager = new SW.app.Application({

    appName: "siteManager"
	, initV: function () {
	    var vp1 = new SW.v.ViewProvider({ viewContext: "default" });
		vp1.register("SiteCollection", "sites");
		vp1.register("Site", "siteDetail");
		this.V.register(vp1);
	}
	, initVM: function () {
	    var vm = new SW.siteAdmin();
	    this.VM.register("siteAdmin", vm);
	    this.setRootVM(vm.siteList);
	    vm.siteList.getPage();
	}

});
  

///Register Applications
SW.sess.register(app_siteManager);



///Initialize the settings (this will be moved to page level script to init in context)
SW.sess.init();
SW.sess.select("siteManager");