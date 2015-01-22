"use strict";
Components.utils.import("chrome://columnswizard/content/mzcw-customcolumns.jsm");
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

		if ("arguments" in window && window.arguments[0]){
			let args = window.arguments[0];

			if ("action" in args){
				switch (args.action){
					case "new":  //Save new custom column
						let newcol={};
						//fixed val
						newcol.isBundled=false;
						newcol.isCustom=true;
						newcol.def="";
						//get userinput val
						newcol.index=document.getElementById("ColumnsWizard.id").value;
						newcol.dbHeader=document.getElementById("ColumnsWizard.dbHeader").value;
						newcol.labelString=document.getElementById("ColumnsWizard.labelString").value;
						newcol.tooltipString=document.getElementById("ColumnsWizard.tooltipString").value;
						newcol.enabled=document.getElementById("ColumnsWizard.enabled").checked;
						dump(">>>>>>>>>>>>> miczColumnsWizard->onAccept: [newcol] "+JSON.stringify(newcol)+"\r\n");
						miczColumnsWizard_CustCols.saveNewCustCol(newcol);
					break;
					case "edit": //TODO
					break;
				}
			}
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
