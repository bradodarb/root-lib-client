
SW.sess = new SW.app.Session({
    domReady: function () {
        infuser.defaults.templateUrl = '/CAMS/admin/Templates/KnockoutTemplate';
        infuser.defaults.templatePrefix = '_';
        infuser.defaults.templateSuffix = '';
        ko.applyBindings(this.current);
        this.queueLocation();
    }
});

var app_themeManager = new SW.app.Application({

    appName: "ThemeManager"
	, initV: function () {
	    var vp1 = new SW.v.ViewProvider({ viewContext: "default" });
		vp1.register("ThemeCollection", "themes");
		vp1.register("Theme", "themeDetail");
		this.V.register(vp1);
	}
	, initVM: function () {
	    var vm = new SW.themeAdmin();
	    this.VM.register("themeAdmin", vm);
	    this.setRootVM(vm.themeList);
	    vm.themeList.getPage();
	}

});
  

///Register Applications
SW.sess.register(app_themeManager);



///Initialize the settings (this will be moved to page level script to init in context)
SW.sess.init();
SW.sess.select("ThemeManager");