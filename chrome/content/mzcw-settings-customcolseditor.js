"use strict";
Components.utils.import("chrome://columnswizard/content/mzcw-customcolsgrid.jsm");
Components.utils.import("resource://gre/modules/osfile.jsm");

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

						if((currcol.labelImagePath)&&(currcol.labelImagePath!="")){
							this.setIconUI(currcol.labelImagePath);
						}

						document.getElementById("ColumnsWizard.tooltipString").setAttribute("value",currcol.tooltipString);
						document.getElementById("ColumnsWizard.sortnumber").setAttribute("checked",currcol.sortnumber);
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
							newcol.index=document.getElementById("ColumnsWizard.id").value.match(re_id).join('').toLowerCase();
						}else{
							newcol.index=document.getElementById("ColumnsWizard.id").value.toLowerCase();
						}
						//Check if the custom column is already present
						let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
						let prefs = prefsc.getBranch("extensions.ColumnsWizard.CustCols.");
						let CustColIndexStr=prefs.getCharPref("index");
						let CustColIndex=new Array();
						if(CustColIndexStr!=''){
							CustColIndex=JSON.parse(CustColIndexStr);
							//dump(">>>>>>>>>>>>> miczColumnsWizard->onAccept: [newcol.index] "+JSON.stringify(newcol.index)+"\r\n");
							if(CustColIndex.indexOf(newcol.index)!=-1){
								//custom column already present
								//dump(">>>>>>>>>>>>> miczColumnsWizard->onAccept: [CustColIndex] "+JSON.stringify(CustColIndex)+"\r\n");
								let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
								let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/mzcw-settings-customcolseditor.properties");
								let prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
								prompts.alert(window,
											  _bundleCW.GetStringFromName("ColumnsWizard.emptyFields.title"),
											  _bundleCW.GetStringFromName("ColumnsWizard.duplicatedID.text"));
								return false;
							}
						}

						if(document.getElementById("ColumnsWizard.dbHeader").value.match(re_dbh)!=null){
							newcol.dbHeader=document.getElementById("ColumnsWizard.dbHeader").value.match(re_dbh).join('').replace(':','').toLowerCase();
						}else{
							newcol.dbHeader=document.getElementById("ColumnsWizard.dbHeader").value.toLowerCase();
						}
						newcol.labelImagePath=miczColumnsWizardPref_CustColEditor.saveIcon(document.getElementById("ColumnsWizard.iconString").value,newcol.dbHeader);
						newcol.labelString=document.getElementById("ColumnsWizard.labelString").value;
						newcol.tooltipString=document.getElementById("ColumnsWizard.tooltipString").value;
						newcol.sortnumber=document.getElementById("ColumnsWizard.sortnumber").checked;
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
						newcol.labelImagePath=miczColumnsWizardPref_CustColEditor.saveIcon(document.getElementById("ColumnsWizard.iconString").value,newcol.dbHeader);
						if(newcol.labelImagePath==""){	//no image, try to delete it, maybe we are modifying and removing an image
							this.deleteIcon(newcol.dbHeader);
						}
						newcol.labelString=document.getElementById("ColumnsWizard.labelString").value;
						newcol.tooltipString=document.getElementById("ColumnsWizard.tooltipString").value;
						newcol.sortnumber=document.getElementById("ColumnsWizard.sortnumber").checked;
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

	setIconUI:function(iconpath){
		document.getElementById("ColumnsWizard.iconString").setAttribute("value",iconpath);
		document.getElementById("ColumnsWizard.setIcon_btn").setAttribute("image","file://"+iconpath);
		document.getElementById("ColumnsWizard.removeIcon_btn").setAttribute("disabled",false);
	},

	removeIconUI:function(){
		document.getElementById("ColumnsWizard.iconString").setAttribute("value","");
		document.getElementById("ColumnsWizard.setIcon_btn").setAttribute("image","");
		document.getElementById("ColumnsWizard.removeIcon_btn").setAttribute("disabled",true);
	},

	chooseIcon:function(){
		let fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
		fp.init(window, "Select an icon file", Components.interfaces.nsIFilePicker.modeOpen);
    	fp.appendFilters(Components.interfaces.nsIFilePicker.filterImages);

    	let fpCallback = function fpCallback_done(aResult) {
		//dump(">>>>>>>>>>>>> miczColumnsWizard->chooseIcon: [aResult] "+JSON.stringify(aResult)+"\r\n");
		if (aResult == Components.interfaces.nsIFilePicker.returnOK) {
			try {
			  if (fp.file) {
				//dump(">>>>>>>>>>>>> miczColumnsWizard->chooseIcon: [file.path] "+JSON.stringify(fp.file.path)+"\r\n");
				miczColumnsWizardPref_CustColEditor.setIconUI(fp.file.path)
			  }
			} catch (ex) {
				dump(">>>>>>>>>>>>> miczColumnsWizard->chooseIcon: [ex.message] "+JSON.stringify(ex.message)+"\r\n");
			}
		  }
		};

		let localFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		fp.displayDirectory = localFile;
		fp.open(fpCallback);
	},

	saveIcon:function(filepath,newname){
		if(filepath=="") return "";
		//save the choosen icon in the user profile folder
		let file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(filepath);
		try {
			if(file){
				let destPath = OS.Path.join(OS.Constants.Path.profileDir,"columnswizardmiczit");
				OS.File.makeDir(destPath, {ignoreExisting: true});
				let destFullPath=OS.Path.join(destPath,newname);
				//dump(">>>>>>>>>>>>> miczColumnsWizard->saveIcon: [file.path] "+JSON.stringify(file.path)+"\r\n");
				//dump(">>>>>>>>>>>>> miczColumnsWizard->saveIcon: [destPath] "+JSON.stringify(destPath)+"\r\n");
				if(file.path.indexOf(destPath)==-1){	//if the icon is already in the dest folder (we're modifying a cust col), do nothing!
					OS.File.copy(file.path,destFullPath);
				}
				return destFullPath;
			}
		}catch(ex){
			dump(">>>>>>>>>>>>> miczColumnsWizard->saveIcon: [ex.message] "+JSON.stringify(ex.message)+"\r\n");
		}
	},

	deleteIcon:function(filename){
		let destPath = OS.Path.join(OS.Constants.Path.profileDir,"columnswizardmiczit");
		let filepath = OS.Path.join(destPath,filename);
		OS.File.remove(filepath);
	},

};
