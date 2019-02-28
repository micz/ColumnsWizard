"use strict";

var EXPORTED_SYMBOLS = ["miczColumnsWizardPref_CustomColsGrid"];

var miczColumnsWizardPref_CustomColsGrid = {

	miczColumnsWizard_CustCols: {},
	win: {},
	onEditCustomCol: {},

	createCustomColsListRows: function (doc, container, CustColRows) {
		// sort cust cols by dbHeader
		let tmp_array = [];
		for (let index in CustColRows) {
			tmp_array.push(index);
		}
		tmp_array.sort(function (a, b) { return a < b ? -1 : (a > b ? 1 : 0); });

		for (let index in tmp_array) {
			this.createOneCustomColRow(doc, container, CustColRows[tmp_array[index]]);
		}
	},

	createOneCustomColRow: function (doc, container, currcol) {
		let strBundleCW = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService);
		let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/overlay.properties");

		if (!container) return;
		let listitem = doc.createElement("listitem");

		// dump(">>>>>>>>>>>>> miczColumnsWizard: [createOneCustomColRow] currcol {"+JSON.stringify(currcol)+"}\r\n");

		let activeCell = doc.createElement("listcell");
		activeCell.setAttribute("class", "listcell-iconic");
		activeCell.setAttribute("enabled", currcol.enabled);
		if (currcol.isCustom) {
			activeCell.setAttribute("label", "*");
		}
		listitem.appendChild(activeCell);

		let searchableCell = doc.createElement("listcell");
		searchableCell.setAttribute("class", "listcell-iconic searchable");
		searchableCell.setAttribute("enabled", currcol.isSearchable);
		listitem.appendChild(searchableCell);

		let idCell = doc.createElement("listcell");
		idCell.setAttribute("label", currcol.index);
		listitem.appendChild(idCell);

		let mailheaderCell = doc.createElement("listcell");
		mailheaderCell.setAttribute("label", currcol.dbHeader);
		listitem.appendChild(mailheaderCell);

		let labelString = '';
		let tooltipString = '';
		if (currcol.isBundled) {
			labelString = _bundleCW.GetStringFromName("ColumnsWizard" + currcol.index + ".label");
			tooltipString = _bundleCW.GetStringFromName("ColumnsWizard" + currcol.index + "Desc.label");
		} else {
			labelString = currcol.labelString;
			tooltipString = currcol.tooltipString;
		}

		let titleCell = doc.createElement("listcell");
		titleCell.setAttribute("label", labelString);
		if ((!currcol.labelImagePath) || (currcol.labelImagePath === "")) {	// no image for this cust col
			titleCell.setAttribute("image", "");
		} else {
			titleCell.setAttribute("image", "file://" + currcol.labelImagePath);
			titleCell.setAttribute("class", "listcell-iconic cw_col_icon");
		}
		listitem.appendChild(titleCell);

		let tooltipCell = doc.createElement("listcell");
		tooltipCell.setAttribute("label", tooltipString);
		listitem.appendChild(tooltipCell);

		listitem._customcol = currcol;

		container.appendChild(listitem);
		// We have to attach this listener to the listitem, even though we only care
		// about clicks on the enabledCell. However, attaching to that item doesn't
		// result in any events actually getting received.
		listitem.addEventListener("click", this.onItemClick, true);
		listitem.addEventListener("dblclick", this.onItemDoubleClick, true);
		return listitem;
	},

	editOneCustomColRow: function (doc, container, currcol, idx_col) {
		let strBundleCW = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService);
		let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/overlay.properties");

		if (!container) return;
		let listitem = container.getItemAtIndex(idx_col);
		if (!listitem) return;

		// dump(">>>>>>>>>>>>> miczColumnsWizard: [editOneCustomColRow] listitem "+JSON.stringify(listitem)+"\r\n");

		let activeCell = listitem.childNodes[0];
		activeCell.setAttribute("enabled", currcol.enabled);
		if (currcol.isCustom) {
			activeCell.setAttribute("label", "*");
		}

		let searchableCell = listitem.childNodes[1];
		searchableCell.setAttribute("enabled", currcol.isSearchable);

		let idCell = listitem.childNodes[2];
		idCell.setAttribute("label", currcol.index);

		let mailheaderCell = listitem.childNodes[3];
		mailheaderCell.setAttribute("label", currcol.dbHeader);

		let labelString = '';
		let tooltipString = '';
		if (currcol.isBundled) {
			labelString = _bundleCW.GetStringFromName("ColumnsWizard" + currcol.index + ".label");
			tooltipString = _bundleCW.GetStringFromName("ColumnsWizard" + currcol.index + "Desc.label");
		} else {
			labelString = currcol.labelString;
			tooltipString = currcol.tooltipString;
		}

		let titleCell = listitem.childNodes[4];
		titleCell.setAttribute("label", labelString);
		if ((!currcol.labelImagePath) || (currcol.labelImagePath === "")) {	// no image for this cust col
			titleCell.setAttribute("image", "");
		} else {
			titleCell.setAttribute("image", "file://" + currcol.labelImagePath);
			titleCell.setAttribute("class", "listcell-iconic cw_col_icon");
		}

		let tooltipCell = listitem.childNodes[5];
		tooltipCell.setAttribute("label", tooltipString);

		listitem._customcol = currcol;

		return listitem;
	},

	/* saveCustomColItem: function(currcol) {
		let value = JSON.stringify(currcol);
		let prefsc = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
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

	deleteOneCustomColRow: function (container, col_idx) {
		container.removeItemAt(col_idx);
	},

	currentCustomCol: function (currlist) {
		let currentItem = currlist.selectedItem;
		return currentItem ? currentItem._customcol : null;
	},

	onItemClick: function (event) {
		// we only care about button 0 (left click) events
		if (event.button !== 0)
			return;

		// Remember, we had to attach the click-listener to the whole listitem, so
		// now we need to see if the clicked the enable-column
		let toggle_enable = event.target.childNodes[0];	// enable
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [onFilterClick] toggle range: from "+toggle.boxObject.x+" to "+(toggle.boxObject.x + toggle.boxObject.width)+"\r\n");
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [onFilterClick] event.clientX "+event.clientX+"\r\n");
		if ((event.clientX < toggle_enable.boxObject.x + toggle_enable.boxObject.width) &&
			(event.clientX > toggle_enable.boxObject.x)) {
			miczColumnsWizardPref_CustomColsGrid.toggleEnable(event.target);
			event.stopPropagation();
		}

		let toggle_searchable = event.target.childNodes[1];	// is searchable
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [onFilterClick] toggle range: from "+toggle.boxObject.x+" to "+(toggle.boxObject.x + toggle.boxObject.width)+"\r\n");
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [onFilterClick] event.clientX "+event.clientX+"\r\n");
		if ((event.clientX < toggle_searchable.boxObject.x + toggle_searchable.boxObject.width) &&
			(event.clientX > toggle_searchable.boxObject.x)) {
			miczColumnsWizardPref_CustomColsGrid.toggleSearchable(event.target);
			event.stopPropagation();
		}
	},

	toggleEnable: function (aCustColItem) {
		let currcol = aCustColItem._customcol;
		currcol.enabled = !currcol.enabled;
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [currcol] "+JSON.stringify(currcol)+"\r\n");

		// miczColumnsWizardPref_CustomColsGrid.saveCustomColItem(currcol);
		this.miczColumnsWizard_CustCols.saveCustCol(currcol);

		// Now update the checkbox
		aCustColItem.childNodes[0].setAttribute("enabled", currcol.enabled);
	},

	toggleSearchable: function (aCustColItem) {
		let currcol = aCustColItem._customcol;
		currcol.isSearchable = !currcol.isSearchable;
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [currcol] "+JSON.stringify(currcol)+"\r\n");

		// miczColumnsWizardPref_CustomColsGrid.saveCustomColItem(currcol);
		this.miczColumnsWizard_CustCols.saveCustCol(currcol);

		// Now update the checkbox
		aCustColItem.childNodes[1].setAttribute("enabled", currcol.isSearchable);
	},

	onItemDoubleClick: function (event) {
		// we only care about button 0 (left click) events
		if (event.button !== 0)
			return;

		miczColumnsWizardPref_CustomColsGrid.onEditCustomCol(miczColumnsWizardPref_CustomColsGrid.win);
	},

};
