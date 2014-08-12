
SW.sess = new SW.app.Session({
    domReady: function () {
        infuser.defaults.templateUrl = '/CAMS/admin/Templates/KnockoutTemplate';
        infuser.defaults.templatePrefix = '_';
        infuser.defaults.templateSuffix = '';
        ko.applyBindings(this.current);
        this.queueLocation();
    }
});

var app_siteStructureBuilder = new SW.app.Application({

    appName: "siteStructureBuilder"

	, initV: function () {
	    var vp1 = new SW.v.ViewProvider({ viewContext: "default" });
	    vp1.register("SiteStructureAdmin", "siteStructureAdmin");
	    vp1.register("SiteStructure", "siteStructure");
	    vp1.register("Area", "areaStructure");
	    vp1.register("Document", "documentStructure");
	    this.V.register(vp1);
	}
	, initVM: function () {
	    var vm = new SW.siteStructureAdmin();
	    this.VM.register("siteStructureAdmin", vm);
	    this.setRootVM(vm);

	    var href = window.location.href;
	    var id = href.substr(href.lastIndexOf('/') + 1)
	    vm.getSiteStructure(id);
	}

});

///Register Applications
SW.sess.register(app_siteStructureBuilder);



///Initialize the settings (this will be moved to page level script to init in context)
SW.sess.init();
SW.sess.select("siteStructureBuilder");