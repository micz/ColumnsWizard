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
		listitem.addEventListener("click", this.onFilterClick, true);
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
	},

	onFilterClick: function(event)
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

	  //TODO
	  //SAVE THE PREF HERE!!! (implement a function!!!)

	  // Now update the checkbox
	  aCustColItem.childNodes[0].setAttribute("enabled", currcol.enabled);
	}

};
