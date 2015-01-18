"use strict";
var EXPORTED_SYMBOLS = ["miczColumnsWizardPref_CustomColsGrid"];

var miczColumnsWizardPref_CustomColsGrid = {

	loadDefaultColRows_Pref:function(){
		let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		let prefs = prefsc.getBranch("extensions.ColumnsWizard.");
		let DefaultColIndexStr=prefs.getCharPref("DefaultColsList");
		let loadedDefaultColIndex=new Array();
		if(DefaultColIndexStr==''){
			//Set default cols if none set at the moment
			loadedDefaultColIndex=this.getOriginalColIndex();
			//dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] default loaded and saved pref\r\n");
			prefs.setCharPref("DefaultColsList",JSON.stringify(loadedDefaultColIndex));
		}else{
			loadedDefaultColIndex=JSON.parse(DefaultColIndexStr);
			//dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] pref loaded\r\n");
			//check if there are new columns to add
			let baseColumnStates=this.getOriginalColIndex();
			if(Object.keys(baseColumnStates).length!=Object.keys(loadedDefaultColIndex).length){ // if the length are different so check the column to add
			//dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] different lengths\r\n");
				for (let key in baseColumnStates) {
				  if (!loadedDefaultColIndex.hasOwnProperty(key)){
					loadedDefaultColIndex[key]=baseColumnStates[key];
					//dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] key not found "+key+"\r\n");
				  }
				}
			}
		}
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] "+JSON.stringify(loadedDefaultColIndex)+"\r\n");
		return loadedDefaultColIndex;
	},

	createCustomColsListRows: function(doc,container,CustColRows){
		for (let index in CustColRows) {
				this.createOneCustomColRow(doc,container,CustColRows[index]);
		}
	},

	createOneCustomColRow:function(doc,container,currcol){
		let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
		let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/overlay.properties");

		if (!container) return;
		let listitem = doc.createElement("listitem");

		dump(">>>>>>>>>>>>> miczColumnsWizard: [createOneCustomColRow] currcol {"+JSON.stringify(currcol)+"}\r\n");

		let activeCell = doc.createElement("listcell");
		activeCell.setAttribute("class", "listcell-iconic");
		activeCell.setAttribute("enabled",currcol.enabled);
		if(currcol.isCustom){
			activeCell.setAttribute("label"," *");
		}
		listitem.appendChild(activeCell);

		let mailheaderCell = doc.createElement("listcell");
		mailheaderCell.setAttribute("label",currcol.dbHeader);
		listitem.appendChild(mailheaderCell);

		let labelString = '';
		let tooltipString = '';
		if(currcol.isBundled){
			labelString = _bundleCW.GetStringFromName("ColumnsWizard"+currcol.index+".label");
			tooltipString = _bundleCW.GetStringFromName("ColumnsWizard"+currcol.index+"Desc.label");
		}else{
			labelString = custcol.labelString;
			tooltipString = custcol.tooltipString;
		}

		let titleCell = doc.createElement("listcell");
		titleCell.setAttribute("label",labelString);
		listitem.appendChild(titleCell);

		let tooltipCell = doc.createElement("listcell");
		tooltipCell.setAttribute("label",tooltipString);
		listitem.appendChild(tooltipCell);

		container.appendChild(listitem);
		// We have to attach this listener to the listitem, even though we only care
		// about clicks on the enabledCell. However, attaching to that item doesn't
		// result in any events actually getting received.
		//listitem.addEventListener("click", onFilterClick, true);
		//listitem.addEventListener("dblclick", onFilterDoubleClick, true);
		return listitem;
	},

	saveDefaultColsGridRows: function(doc,container,save_pref) {
		let value = JSON.stringify(this.getDefaultCols(container));
	  	if(save_pref){
		  let preference = doc.getElementById("ColumnsWizard.DefaultColsList");
		  preference.value = value;
    	}
    	return value;
	},

};
