"use strict";

let EXPORTED_SYMBOLS = ["miczColumnsWizardUtils"];


var miczColumnsWizardUtils = {

	Services:Components.utils.import("resource://gre/modules/Services.jsm"),
	mHost:null,

	get HostSystem(){
		if (null==miczColumnsWizardUtils.mHost){
			let osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
			miczColumnsWizardUtils.mHost = osString.toLowerCase();
		}
		return miczColumnsWizardUtils.mHost; // linux - winnt - darwin
	},

	/*getMail3PaneWindow:function getMail3PaneWindow(){
		let windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1']
				.getService(Components.interfaces.nsIWindowMediator),
		    win3pane = windowManager.getMostRecentWindow("mail:3pane");
		return win3pane;
	},*/

};
