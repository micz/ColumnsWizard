"use strict";
Components.utils.import("chrome://columnswizard/content/mzcw-customcolsgrid.jsm");

var miczColumnsWizard={};
var miczColumnsWizardPref_CustColEditor = {
	
	_sanitize_ID_regex:"([A-Za-z0-9\-\_]+)",
	_sanitize_dbHeader_regex:"([\x21-\x7E2]+)",

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
						
						//disable the ID and dbheader field
						document.getElementById("ColumnsWizard.id").disabled=true;
						document.getElementById("ColumnsWizard.dbHeader").disabled=true;
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
			
			let re_id=new RegExp(miczColumnsWizardPref_CustColEditor._sanitize_ID_regex,'ig');
			let re_dbh=new RegExp(miczColumnsWizardPref_CustColEditor._sanitize_dbHeader_regex,'g');

			if ("action" in args){
				switch (args.action){
					case "new":  //Save new custom column
						//fixed val
						newcol.isBundled=false;
						newcol.isCustom=true;
						newcol.def="";
						//get userinput val
						if(document.getElementById("ColumnsWizard.id").value.match(re_id)!=null){
							newcol.index=document.getElementById("ColumnsWizard.id").value.match(re_id).join('');
						}else{
							newcol.index=document.getElementById("ColumnsWizard.id").value;
						}
						if(document.getElementById("ColumnsWizard.dbHeader").value.match(re_dbh)!=null){
							newcol.dbHeader=document.getElementById("ColumnsWizard.dbHeader").value.match(re_dbh).join('').replace(':','');
						}else{
							newcol.dbHeader=document.getElementById("ColumnsWizard.dbHeader").value;
						}
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
						newcol.dbHeader=currcol.dbHeader;
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
		//The fields must be filled!!
		//The input are already sanitized elsewhere...
		if((document.getElementById("ColumnsWizard.id").value=="")||(document.getElementById("ColumnsWizard.dbHeader").value=="")||(document.getElementById("ColumnsWizard.labelString").value=="")||(document.getElementById("ColumnsWizard.tooltipString").value=="")){
			let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
			let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/mzcw-settings-customcolseditor.properties");
			let prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
			prompts.alert(window,
                          _bundleCW.GetStringFromName("ColumnsWizard.emptyFields.title"),
                          _bundleCW.GetStringFromName("ColumnsWizard.emptyFields.text"));
			return false;
		}
		return true;
	},
	
	onBlur_sanitize_ID:function(){
		let re=new RegExp(miczColumnsWizardPref_CustColEditor._sanitize_ID_regex,'ig');
		let el=document.getElementById('ColumnsWizard.id');
		if(el.value.match(re)!=null){
			el.value=el.value.match(re).join('');
		}
	},
	
	onBlur_sanitize_dbHeader:function(){
		let re=new RegExp(miczColumnsWizardPref_CustColEditor._sanitize_dbHeader_regex,'g');
		let el=document.getElementById('ColumnsWizard.dbHeader');
		if(el.value.match(re)!=null){
			el.value=el.value.match(re).join('').replace(':','');
		}
	},

};
