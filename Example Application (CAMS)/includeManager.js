






SW.sess = new SW.app.Session({
    domReady: function () {
        infuser.defaults.templateUrl = '/CAMS/admin/Templates/KnockoutTemplate';
        infuser.defaults.templatePrefix = '_';
        infuser.defaults.templateSuffix = '';
        ko.applyBindings(this.current);
        this.queueLocation();
    }
});

var app_includeManager = new SW.app.Application({

    appName: "IncludeManager"
	, initV: function () {
	    var vp1 = new SW.v.ViewProvider({ viewContext: "default" });
		vp1.register("IncludeCollection", "includes");
		vp1.register("Include", "includeDetail");
		this.V.register(vp1);
	}
	, initVM: function () {
	    var vm = new SW.includeAdmin();
	    this.VM.register("includeAdmin", vm);
	    this.setRootVM(vm.includeList);
	    vm.includeList.getPage();
	}

});
  

///Register Applications
SW.sess.register(app_includeManager);



///Initialize the settings (this will be moved to page level script to init in context)
SW.sess.init();
SW.sess.select("IncludeManager");