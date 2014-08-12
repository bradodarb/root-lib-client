
SW.sess = new SW.app.Session({
    domReady: function () {
        infuser.defaults.templateUrl = '/CAMS/admin/Templates/KnockoutTemplate';
        infuser.defaults.templatePrefix = '_';
        infuser.defaults.templateSuffix = '';
        ko.applyBindings(this.current);
        this.queueLocation();
    }
});

var app_parameterTypeEditor = new SW.app.Application({

    appName: "parameterTypeManager"

	, initV: function () {
	    var vp1 = new SW.v.ViewProvider({ viewContext: "default" });
	    vp1.register("ParameterType", "ParameterTypeStructure");
	    this.V.register(vp1);
	}
	, initVM: function () {
	    var vm = new SW.parameterTypeEditor();
	    this.VM.register("parameterTypeEditor", vm);
	    this.setRootVM(vm);


	    var href = window.location.href;
	    var id = href.substr(href.lastIndexOf('/') + 1)
	    vm.getParameterType(id);
	}

});

///Register Applications
SW.sess.register(app_parameterTypeEditor);



///Initialize the settings (this will be moved to page level script to init in context)
SW.sess.init();
SW.sess.select("parameterTypeManager");