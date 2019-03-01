"use strict";

var EXPORTED_SYMBOLS = ["miczColumnsWizardUtils"];

var miczColumnsWizardUtils = {

	Services: ChromeUtils.import("resource://gre/modules/Services.jsm"),
	mHost: null,

	get HostSystem() {
		if (null === miczColumnsWizardUtils.mHost) {
			let osString = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS;
			miczColumnsWizardUtils.mHost = osString.toLowerCase();
		}
		return miczColumnsWizardUtils.mHost; // linux - winnt - darwin
	},

	/* getMail3PaneWindow:function getMail3PaneWindow(){
		let windowManager = Cc['@mozilla.org/appshell/window-mediator;1']
				.getService(Ci.nsIWindowMediator),
		    win3pane = windowManager.getMostRecentWindow("mail:3pane");
		return win3pane;
	},
	*/

};
