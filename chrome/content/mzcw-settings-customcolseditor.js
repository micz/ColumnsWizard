"use strict";
Components.utils.import("chrome://columnswizard/content/mzcw-customcolsgrid.jsm");

var miczColumnsWizard={};
var miczColumnsWizardPref_CustColEditor = {

	onLoad: function(){

		//Fixing window height
		sizeToContent();
		var vbox = document.getElementById('cw_vbox');
		vbox.height = vbox.boxObject.height;
		sizeToContent();

		if ("arguments" in window && window.arguments[0]){
			let args = window.arguments[0];

			if ("action" in args){
				switch (args.action){
					case "new": //window.document.getElementById("ColumnsWizard.dbHeader").setAttribute("value","ok");
					break;
					case "edit": //TODO
					break;
				}
			}
		}
	},

	onAccept:function(){
		if(!miczColumnsWizardPref_CustColEditor.checkFields()){
			return false;
		}
		return true;
	},

	checkFields:function(){
		//TODO... also message prompts on error...
		/* example   Services.prompt.alert(window,
                          gFilterBundle.getString("cannotHaveDuplicateFilterTitle"),
                          gFilterBundle.getString("cannotHaveDuplicateFilterMessage"));
		 */
		return true;
	},

};
