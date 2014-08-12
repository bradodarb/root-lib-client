
SW.sess = new SW.app.Session({
    domReady: function () {
        infuser.defaults.templateUrl = '/CAMS/admin/Templates/KnockoutTemplate';
        infuser.defaults.templatePrefix = '_';
        infuser.defaults.templateSuffix = '';
        ko.applyBindings(this.current);
        this.queueLocation();
    }
});

var app_areaEditor = new SW.app.Application({

    appName: "areaEditor"

	, initV: function () {
	    var vp1 = new SW.v.ViewProvider({ viewContext: "default" });
	    vp1.register("Area", "areaStructure");
	    this.V.register(vp1);
	}
	, initVM: function () {
	    var vm = new SW.areaEditor();
	    this.VM.register("areaEditor", vm);
	    this.setRootVM(vm);


	    var href = window.location.href;
	    var id = href.substr(href.lastIndexOf('/') + 1)
	    vm.getArea(id);
	}

});

///Register Applications
SW.sess.register(app_areaEditor);



///Initialize the settings (this will be moved to page level script to init in context)
SW.sess.init();
SW.sess.select("areaEditor");