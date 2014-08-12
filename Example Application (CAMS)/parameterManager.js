
SW.sess = new SW.app.Session({
    domReady: function () {
        infuser.defaults.templateUrl = '/CAMS/admin/Templates/KnockoutTemplate';
        infuser.defaults.templatePrefix = '_';
        infuser.defaults.templateSuffix = '';
        ko.applyBindings(this.current);
        this.queueLocation();
    }
});

var app_parameterManager = new SW.app.Application({

    appName: "ParameterManager"
	, initV: function () {
	    var vp1 = new SW.v.ViewProvider({ viewContext: "default" });
		vp1.register("ParameterCollection", "parameters");
		vp1.register("Parameter", "parameterDetail");
		this.V.register(vp1);
	}
	, initVM: function () {
	    var vm = new SW.parameterAdmin();
	    this.VM.register("parameterAdmin", vm);
	    this.setRootVM(vm.parameterList);
	    vm.parameterList.getPage();
	}

});
  

///Register Applications
SW.sess.register(app_parameterManager);



///Initialize the settings (this will be moved to page level script to init in context)
SW.sess.init();
SW.sess.select("ParameterManager");