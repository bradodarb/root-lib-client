






SW.sess = new SW.app.Session({
    domReady: function () {
        infuser.defaults.templateUrl = '/CAMS/admin/Templates/KnockoutTemplate';
        infuser.defaults.templatePrefix = '_';
        infuser.defaults.templateSuffix = '';
        ko.applyBindings(this.current);
        this.queueLocation();
    }
});

var app_areaManager = new SW.app.Application({

    appName: "AreaManager"
	, initV: function () {
	    var vp1 = new SW.v.ViewProvider({ viewContext: "default" });
		vp1.register("AreaCollection", "areas");
		vp1.register("Area", "areaDetail");
		this.V.register(vp1);
	}
	, initVM: function () {
	    var vm = new SW.areaAdmin();
	    this.VM.register("areaAdmin", vm);
	    this.setRootVM(vm.areaList);
	    vm.areaList.getPage();
	}

});
  

///Register Applications
SW.sess.register(app_areaManager);



///Initialize the settings (this will be moved to page level script to init in context)
SW.sess.init();
SW.sess.select("AreaManager");