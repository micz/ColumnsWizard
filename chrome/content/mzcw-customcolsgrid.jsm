"use strict";
//Components.utils.import("chrome://columnswizard/content/mzcw-customcolumns.jsm");

var EXPORTED_SYMBOLS = ["miczColumnsWizardPref_CustomColsGrid"];

var miczColumnsWizardPref_CustomColsGrid = {
	
	miczColumnsWizard_CustCols:{},

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
		if(currcol.isCustom){
			activeCell.setAttribute("label","*");
		}
		listitem.appendChild(activeCell);

		let idCell = doc.createElement("listcell");
		idCell.setAttribute("label",currcol.index);
		listitem.appendChild(idCell);

		let mailheaderCell = doc.createElement("listcell");
		mailheaderCell.setAttribute("label",currcol.dbHeader);
		listitem.appendChild(mailheaderCell);

		let labelString = '';
		let tooltipString = '';
		if(currcol.isBundled){
			labelString = _bundleCW.GetStringFromName("ColumnsWizard"+currcol.index+".label");
			tooltipString = _bundleCW.GetStringFromName("ColumnsWizard"+currcol.index+"Desc.label");
		}else{
			labelString = currcol.labelString;
			tooltipString = currcol.tooltipString;
		}

		let titleCell = doc.createElement("listcell");
		titleCell.setAttribute("label",labelString);
		listitem.appendChild(titleCell);

		let tooltipCell = doc.createElement("listcell");
		tooltipCell.setAttribute("label",tooltipString);
		listitem.appendChild(tooltipCell);

		listitem._customcol=currcol;

		container.appendChild(listitem);
		// We have to attach this listener to the listitem, even though we only care
		// about clicks on the enabledCell. However, attaching to that item doesn't
		// result in any events actually getting received.
		listitem.addEventListener("click", this.onItemClick, true);
		//listitem.addEventListener("dblclick", onItemDoubleClick, true);
		return listitem;
	},

	editOneCustomColRow:function(doc,container,currcol,idx_col){
		let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
		let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/overlay.properties");

		if (!container) return;
		let listitem = container.getItemAtIndex(idx_col);
		if(!listitem) return;
		
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [editOneCustomColRow] listitem "+JSON.stringify(listitem)+"\r\n");
		
		let activeCell = listitem.childNodes[0];
		activeCell.setAttribute("enabled",currcol.enabled);
		if(currcol.isCustom){
			activeCell.setAttribute("label","*");
		}

		let idCell = listitem.childNodes[1];
		idCell.setAttribute("label",currcol.index);

		let mailheaderCell = listitem.childNodes[2];
		mailheaderCell.setAttribute("label",currcol.dbHeader);

		let labelString = '';
		let tooltipString = '';
		if(currcol.isBundled){
			labelString = _bundleCW.GetStringFromName("ColumnsWizard"+currcol.index+".label");
			tooltipString = _bundleCW.GetStringFromName("ColumnsWizard"+currcol.index+"Desc.label");
		}else{
			labelString = currcol.labelString;
			tooltipString = currcol.tooltipString;
		}

		let titleCell = listitem.childNodes[3];
		titleCell.setAttribute("label",labelString);

		let tooltipCell = listitem.childNodes[4];
		tooltipCell.setAttribute("label",tooltipString);

		listitem._customcol=currcol;

		return listitem;
	},

	/*saveCustomColItem: function(currcol) {
		let value = JSON.stringify(currcol);
		let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		//Saving custom columns item to prefs
		let prefs_def = prefsc.getBranch("extensions.ColumnsWizard.CustCols.def.");
		prefs_def.setCharPref(currcol.index,value);

		//Saving enabled status to prefs (for bundled custom columns)
		if((currcol.isBundled)&&(currcol.def !== undefined)&&(currcol.def != "")){
			let prefs=prefsc.getBranch("extensions.ColumnsWizard.CustCols.");
			prefs.setBoolPref(currcol.def,currcol.enabled);
		}

    	return value;
	},*/

	deleteOneCustomColRow: function(container,col_idx){
		container.removeItemAt(col_idx);
	},

	currentCustomCol: function(currlist)
	{
	  let currentItem = currlist.selectedItem;
	  return currentItem ? currentItem._customcol : null;
	},

	onItemClick: function(event)
	{
		// we only care about button 0 (left click) events
		if (event.button != 0)
		  return;

		// Remember, we had to attach the click-listener to the whole listitem, so
		// now we need to see if the clicked the enable-column
		let toggle = event.target.childNodes[0];
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [onFilterClick] toggle range: from "+toggle.boxObject.x+" to "+(toggle.boxObject.x + toggle.boxObject.width)+"\r\n");
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [onFilterClick] event.clientX "+event.clientX+"\r\n");
		if ((event.clientX < toggle.boxObject.x + toggle.boxObject.width) &&
			(event.clientX > toggle.boxObject.x)) {
		  miczColumnsWizardPref_CustomColsGrid.toggleEnable(event.target);
		  event.stopPropagation();
		}
	},

	toggleEnable: function(aCustColItem)
	{
	  let currcol = aCustColItem._customcol;
	  currcol.enabled = !currcol.enabled;
	  //dump(">>>>>>>>>>>>> miczColumnsWizard: [currcol] "+JSON.stringify(currcol)+"\r\n");

	  //miczColumnsWizardPref_CustomColsGrid.saveCustomColItem(currcol);
	  this.miczColumnsWizard_CustCols.saveCustCol(currcol);

	  // Now update the checkbox
	  aCustColItem.childNodes[0].setAttribute("enabled", currcol.enabled);
	},

};
