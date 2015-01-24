"use strict";
//Components.utils.import("chrome://columnswizard/content/mzcw-customcolumns.jsm");
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
					//case "new": //window.document.getElementById("ColumnsWizard.dbHeader").setAttribute("value","ok");
					//break;
					case "edit":
						let currcol=JSON.parse(args.currcol);
						let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
						let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/mzcw-settings-customcolseditor.properties");
						document.getElementById("cw_desc.label").label=_bundleCW.GetStringFromName("ColumnsWizard.DescEdit.label");

						//fill the fields
						document.getElementById("ColumnsWizard.id").setAttribute("value",currcol.index);
						document.getElementById("ColumnsWizard.dbHeader").setAttribute("value",currcol.dbHeader);
						document.getElementById("ColumnsWizard.labelString").setAttribute("value",currcol.labelString);
						document.getElementById("ColumnsWizard.tooltipString").setAttribute("value",currcol.tooltipString);
						document.getElementById("ColumnsWizard.enabled").setAttribute("checked",currcol.enabled);
						
						//disable the ID field
						document.getElementById("ColumnsWizard.id").disabled=true;				
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
			let newcol={};

			if ("action" in args){
				switch (args.action){
					case "new":  //Save new custom column
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
						//dump(">>>>>>>>>>>>> miczColumnsWizard->onAccept: [newcol] "+JSON.stringify(newcol)+"\r\n");
						//miczColumnsWizard_CustCols.addNewCustCol(newcol);
						window.arguments[0].save=true;
						window.arguments[0].newcol=newcol;
					break;
					case "edit":	//Modify the custom column
						let currcol=JSON.parse(args.currcol);
						//fixed val
						newcol.isBundled=false;
						newcol.isCustom=true;
						newcol.def="";
						//get userinput val
						newcol.index=currcol.index;
						newcol.dbHeader=document.getElementById("ColumnsWizard.dbHeader").value;
						newcol.labelString=document.getElementById("ColumnsWizard.labelString").value;
						newcol.tooltipString=document.getElementById("ColumnsWizard.tooltipString").value;
						newcol.enabled=document.getElementById("ColumnsWizard.enabled").checked;
						//dump(">>>>>>>>>>>>> miczColumnsWizard->onAccept: [newcol] "+JSON.stringify(newcol)+"\r\n");
						//miczColumnsWizard_CustCols.addNewCustCol(newcol);
						window.arguments[0].save=true;
						window.arguments[0].newcol=newcol;
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
