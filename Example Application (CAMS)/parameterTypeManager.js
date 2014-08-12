






SW.sess = new SW.app.Session({
    domReady: function () {
        infuser.defaults.templateUrl = '/CAMS/admin/Templates/KnockoutTemplate';
        infuser.defaults.templatePrefix = '_';
        infuser.defaults.templateSuffix = '';
        ko.applyBindings(this.current);
        this.queueLocation();
    }
});

var app_parameterTypeManager = new SW.app.Application({

    appName: "ParameterTypeManager"
	, initV: function () {
	    var vp1 = new SW.v.ViewProvider({ viewContext: "default" });
		vp1.register("ParameterTypeCollection", "parameterTypes");
		vp1.register("ParameterType", "parameterTypeDetail");
		this.V.register(vp1);
	}
	, initVM: function () {
	    var vm = new SW.parameterTypeAdmin();
	    this.VM.register("parameterTypeAdmin", vm);
	    this.setRootVM(vm.parameterTypeList);
	    vm.parameterTypeList.getPage();
	}

});
  

///Register Applications
SW.sess.register(app_parameterTypeManager);



///Initialize the settings (this will be moved to page level script to init in context)
SW.sess.init();
SW.sess.select("ParameterTypeManager");