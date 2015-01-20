"use strict";
var EXPORTED_SYMBOLS = ["miczColumnsWizardPref_CustomColsGrid"];

var miczColumnsWizardPref_CustomColsGrid = {

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

		//dump(">>>>>>>>>>>>> miczColumnsWizard: [createOneCustomColRow] currcol {"+JSON.stringify(currcol)+"}\r\n");

		let activeCell = doc.createElement("listcell");
		activeCell.setAttribute("class", "listcell-iconic");
		activeCell.setAttribute("enabled",currcol.enabled);
		activeCell.setAttribute("maxwidth","32px");
		if(currcol.isCustom){
			activeCell.setAttribute("label"," *");
		}
		listitem.appendChild(activeCell);

		let mailheaderCell = doc.createElement("listcell");
		mailheaderCell.setAttribute("label",currcol.dbHeader);
		mailheaderCell.setAttribute("flex","1");
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
		titleCell.setAttribute("flex","1");
		listitem.appendChild(titleCell);

		let tooltipCell = doc.createElement("listcell");
		tooltipCell.setAttribute("label",tooltipString);
		tooltipCell.setAttribute("flex","1");
		listitem.appendChild(tooltipCell);

		listitem._customcol=currcol;

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

	currentCustomCol: function(currlist)
	{
	  let currentItem = currlist.selectedItem;
	  return currentItem ? currentItem._customcol : null;
	}

};
