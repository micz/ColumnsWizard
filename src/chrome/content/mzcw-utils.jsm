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

};
