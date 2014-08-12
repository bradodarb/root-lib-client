﻿
SW.sess = new SW.app.Session({
    domReady: function () {
        infuser.defaults.templateUrl = '/CAMS/admin/Templates/KnockoutTemplate';
        infuser.defaults.templatePrefix = '_';
        infuser.defaults.templateSuffix = '';
        ko.applyBindings(this.current);
        this.queueLocation();
    }
});

var app_sectionTypeEditor = new SW.app.Application({

    appName: "sectionTypeManager"

	, initV: function () {
	    var vp1 = new SW.v.ViewProvider({ viewContext: "default" });
	    vp1.register("SectionType", "sectionTypeStructure");
	    this.V.register(vp1);
	}
	, initVM: function () {
	    var vm = new SW.sectionTypeEditor();
	    this.VM.register("sectionTypeEditor", vm);
	    this.setRootVM(vm);



	    var href = window.location.href;
	    var id = href.substr(href.lastIndexOf('/') + 1)
	    vm.getSectionType(id);
	}

});

///Register Applications
SW.sess.register(app_sectionTypeEditor);



///Initialize the settings (this will be moved to page level script to init in context)
SW.sess.init();
SW.sess.select("sectionTypeManager");