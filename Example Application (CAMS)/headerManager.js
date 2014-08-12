

SW.sess = new SW.app.Session({
    domReady: function () {
        infuser.defaults.templateUrl = '/CAMS/admin/Templates/KnockoutTemplate';
        infuser.defaults.templatePrefix = '_';
        infuser.defaults.templateSuffix = '';
        ko.applyBindings(this.current);
        this.queueLocation();
    }
});

var app_headerManager = new SW.app.Application({

    appName: "HeaderManager"
	, initV: function () {
	    var vp1 = new SW.v.ViewProvider({ viewContext: "default" });
		vp1.register("HeaderCollection", "headers");
		vp1.register("Header", "headerDetail");
		this.V.register(vp1);
	}
	, initVM: function () {
	    var vm = new SW.headerAdmin();
	    this.VM.register("headerAdmin", vm);
	    this.setRootVM(vm.headerList);
	    vm.headerList.getPage();
	}

});
  

///Register Applications
SW.sess.register(app_headerManager);



///Initialize the settings (this will be moved to page level script to init in context)
SW.sess.init();
SW.sess.select("HeaderManager");