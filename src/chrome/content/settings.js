/* List.js is required to make this table work. */

"use strict";

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
var { miczColumnsWizardPref_CustomColsGrid } = ChromeUtils.import("chrome://columnswizard/content/mzcw-customcolsgrid.jsm");
var { miczColumnsWizardPref_DefaultColsList } = ChromeUtils.import("chrome://columnswizard/content/mzcw-defaultcolslist.jsm");
var { miczColumnsWizardPrefsUtils } = ChromeUtils.import("chrome://columnswizard/content/mzcw-prefsutils.jsm");

// var miczColumnsWizard = window.opener.miczColumnsWizard;
var miczColumnsWizard = window.miczColumnsWizard;
var defaultColsListObj;

var miczColumnsWizardPref2 = {

	htmlToElements: function (html) {
		var domParser = new DOMParser();
		domParser.forceEnableXULXBL();
		var docFragment = domParser.parseFromString(html, 'text/html');
		// console.debug(docFragment.body.firstChild.outerHTML);
		return docFragment.body.firstChild;
	},

	settingsLoad: function () {

		let cbelement = document.getElementById("ColumnsWizard.DefaultColsList.active_checkbox");
		let dca = miczColumnsWizardPrefsUtils.getBoolPref_CW("DefaultColsList.active");

		if (dca) {
			cbelement.checked = true;
		} else {
			cbelement.removeAttribute("checked");
		}
		
		miczColumnsWizardPref2.registerPreferenceListeners([
			"ColumnsWizard.DefaultColsList.active_checkbox",
		]);


		// const { require } = ChromeUtils.import("resource://gre/modules/commonjs/toolkit/require.js", {});

		// Services.scriptloader.loadSubScript("chrome://columnswizard/content/modules/list.js", {});
		// var  { List2 } = ChromeUtils.import("chrome://columnswizard/content/modules/list.js", this);
		// var ListObj = new List1.List('defaultColsListDiv');
		// console.debug(ListObj);
		console.debug('Start');

		miczColumnsWizardPref_DefaultColsList.initDefaultColsList(window);
		



	},

	// cleidigh list functions

	loadDefaultColRows_Pref: function () {
		// let prefsc = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
		// let prefs = prefsc.getBranch("extensions.ColumnsWizard.");
		// let DefaultColIndexStr=prefs.getCharPref("DefaultColsList");
		let DefaultColIndexStr = miczColumnsWizardPrefsUtils.getCharPref_CW("DefaultColsList");
		// console.debug(`CurrentIndexS: ${DefaultColIndexStr}`);
		let loadedDefaultColIndex = [];
		if (DefaultColIndexStr === '') {
			// Set default cols if none set at the moment
			loadedDefaultColIndex = miczColumnsWizardPref_DefaultColsList.getOriginalColIndex();
			// console.debug(`D IndexS: ${DefaultColIndexStr}`);
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] default loaded and saved pref\r\n");
		} else {
			loadedDefaultColIndex = JSON.parse(DefaultColIndexStr);
			// console.debug(`L IndexS: ${loadedDefaultColIndex}`); 
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] pref loaded\r\n");
		}
		// fix wrong ordina values: columns must have odd ordinal values, because even values are for splitters (used for columns resizing)
		loadedDefaultColIndex = miczColumnsWizardPref_DefaultColsList.fixOrdinalValues(loadedDefaultColIndex);
		// check if there are new columns to add
		let baseColumnStates = miczColumnsWizardPref_DefaultColsList.getOriginalColIndex();
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid] baseColumnState "+JSON.stringify(baseColumnStates)+"\r\n");
		if (Object.keys(baseColumnStates).length !== Object.keys(loadedDefaultColIndex).length) { // if the length are different so check the column to add
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] different lengths\r\n");
			for (let key in baseColumnStates) {
				if (!loadedDefaultColIndex.hasOwnProperty(key)) {
					loadedDefaultColIndex[key] = baseColumnStates[key];
					// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] key not found "+key+"\r\n");
				}
			}
		}
		miczColumnsWizardPrefsUtils.setCharPref_CW("DefaultColsList", JSON.stringify(loadedDefaultColIndex));
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] "+JSON.stringify(loadedDefaultColIndex)+"\r\n");
		return loadedDefaultColIndex;
	},

	sortDefaultColsList: function () {
		let DefColRows = miczColumnsWizardPref2.loadDefaultColRows_Pref();
		// Sort the columns, by the ordinal value...
		let sorted_cols = [];
		for (let cwcol in DefColRows) {
			let col_ordinal = DefColRows[cwcol].ordinal === 0 ? 99 : DefColRows[cwcol].ordinal;
			sorted_cols.push([cwcol, col_ordinal]);
		}
		sorted_cols.sort(function (a, b) { return a[1] - b[1]; });
		for (let index in sorted_cols) {
			DefColRows[sorted_cols[index][0]].currindex = sorted_cols[index][0];
			// this.createOneDefaultColListRow(DefColRows[sorted_cols[index][0]]);
		}
		return {defaultCols: DefColRows, sorted_cols: sorted_cols};
	},


	createOneDefaultColListRow(cwcol) {

	},


	createOneDefaultColRow: function (doc, container, currcol, ref) {
		const XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
		// try {
		if (!container) return;
		let row = doc.createElementNS(XUL, "row");
		row.setAttribute("class", "mzcw-col_grid_rows");

		// we found no valid preference
		if (currcol.visible === undefined) return;

		let col_id = doc.createElementNS(XUL, "label");
		col_id.setAttribute("value", currcol.currindex);
		col_id.setAttribute("cwcol", 'currindex');
		col_id.setAttribute("hidden", 'true');

		let col_enable = doc.createElementNS(XUL, "checkbox");
		col_enable.setAttribute("checked", currcol.visible);
		col_enable.setAttribute("cwcol", 'visible');

		let col_sortby;
		if (miczColumnsWizardPref_DefaultColsList.getSortType(currcol.currindex) !== -1) { // SORT BY only if a standard col. No way to save a customcol for sorting
			col_sortby = doc.createElementNS(XUL, "radio");
			col_sortby.setAttribute("group", "cw_sortby");
			col_sortby.setAttribute("value", currcol.currindex);
			col_sortby.setAttribute("cwcol", 'sortby');
			col_sortby.setAttribute("type", 'radio');
			// if(currcol.sortby===undefined)currcol.sortby=false;
			// if(currcol.sortby)col_sortby.setAttribute("selected", true);
			// let prefsc = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
			// let prefs = prefsc.getBranch("mailnews.");
			// let sortcolindex=prefs.getIntPref("default_sort_type");
			let sortcolindex = miczColumnsWizardPrefsUtils.getIntPref("mailnews.default_sort_type");
			if (sortcolindex === miczColumnsWizardPref_DefaultColsList.getSortType(currcol.currindex)) col_sortby.setAttribute("selected", true);
		} else {
			col_sortby = doc.createElementNS(XUL, "label");
			// col_sortby.setAttribute("hidden", 'true');
			col_sortby.setAttribute("value", ' ');
		}

		let col_title = doc.createElementNS(XUL, "label");
		col_title.setAttribute("value", this.getColLocalizedString(currcol.currindex));
		col_title.setAttribute("cwcol", 'col_title');

		let [col_flex] = [
			// filter, value, size
			["flex", currcol.flex !== undefined ? currcol.flex : 0, "10"]].map(function (attributes) {
				let element = doc.createElementNS(XUL, "textbox");
				let [filter, value, size] = attributes;
				element.setAttribute("cwcol", filter);
				if (size) element.setAttribute("size", size);
				element.setAttribute("value", value);
				if (filter === "flex") element.setAttribute('hidden', true);
				return element;
			});

		let [up, down] = [
			['\u2191', function (aEvent) { miczColumnsWizardPref_DefaultColsList.upDownCol(row, true); }, ''],
			['\u2193', function (aEvent) { miczColumnsWizardPref_DefaultColsList.upDownCol(row, false); }, '']].map(function (attributes) {
				let element = doc.createElementNS(XUL, "toolbarbutton");
				element.setAttribute("label", attributes[0]);
				element.addEventListener("command", attributes[1], false);
				if (attributes[2]) element.classList.add(attributes[2]);
				return element;
			});

		row.classList.add(colClass);
		[col_id, col_enable, col_sortby, col_title, col_flex, up, down].forEach(function (item) {
			row.insertBefore(item, null);
		});
		container.insertBefore(row, ref);
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid createOneDefaultColRow] "+currindex+"\r\n");
		return row;
		/* } catch(err) {
		  dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid createOneDefaultColRow error] "+err+"\r\n");
		}*/
	},

	getColLocalizedString: function (col) {
		let _bundleCW = Services.strings.createBundle("chrome://columnswizard/locale/settings.properties");
		let strOut = col;

		switch (col) {
			case "threadCol":
				strOut = _bundleCW.GetStringFromName("ColumnsWizard.threadColumn.label");
				break;
			case "senderCol":
				strOut = _bundleCW.GetStringFromName("ColumnsWizard.fromColumn.label");
				break;
			case "recipientCol":
				strOut = _bundleCW.GetStringFromName("ColumnsWizard.recipientColumn.label");
				break;
			case "subjectCol":
				strOut = _bundleCW.GetStringFromName("ColumnsWizard.subjectColumn.label");
				break;
			case "dateCol":
				strOut = _bundleCW.GetStringFromName("ColumnsWizard.dateColumn.label");
				break;
			case "priorityCol":
				strOut = _bundleCW.GetStringFromName("ColumnsWizard.priorityColumn.label");
				break;
			case "tagsCol":
				strOut = _bundleCW.GetStringFromName("ColumnsWizard.tagsColumn.label");
				break;
			case "accountCol":
				strOut = _bundleCW.GetStringFromName("ColumnsWizard.accountColumn.label");
				break;
			case "statusCol":
				strOut = _bundleCW.GetStringFromName("ColumnsWizard.statusColumn.label");
				break;
			case "sizeCol":
				strOut = _bundleCW.GetStringFromName("ColumnsWizard.sizeColumn.label");
				break;
			case "junkStatusCol":
				strOut = _bundleCW.GetStringFromName("ColumnsWizard.junkStatusColumn.label");
				break;
			case "unreadCol":
				strOut = _bundleCW.GetStringFromName("ColumnsWizard.unreadColumn.label");
				break;
			case "totalCol":
				strOut = _bundleCW.GetStringFromName("ColumnsWizard.totalColumn.label");
				break;
			case "unreadButtonColHeader":
				strOut = _bundleCW.GetStringFromName("ColumnsWizard.readColumn.label");
				break;
			case "receivedCol":
				strOut = _bundleCW.GetStringFromName("ColumnsWizard.receivedColumn.label");
				break;
			case "flaggedCol":
				strOut = _bundleCW.GetStringFromName("ColumnsWizard.starredColumn.label");
				break;
			case "locationCol":
				strOut = _bundleCW.GetStringFromName("ColumnsWizard.locationColumn.label");
				break;
			case "idCol":
				strOut = _bundleCW.GetStringFromName("ColumnsWizard.idColumn.label");
				break;
			case "attachmentCol":
				strOut = _bundleCW.GetStringFromName("ColumnsWizard.attachmentColumn.label");
				break;
			case "correspondentCol":
				strOut = _bundleCW.GetStringFromName("ColumnsWizard.correspondentCol.label");
				break;
			default: {

				let col_idx = col.replace('Col_cw', '');
				let col_el = this.loadedCustCols[col_idx];
				// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid] col_idx "+col_idx+"\r\n");
				let _bundleCW_overlay = Services.strings.createBundle("chrome://columnswizard/locale/overlay.properties");
				if (this.loadedCustCols[col_idx]) {
					if (col_el.isBundled) {
						strOut = _bundleCW_overlay.GetStringFromName("ColumnsWizard" + col_el.index + ".label");
					} else {
						strOut = col_el.labelString;
					}
				}
				break;
			}
		}
		return strOut;
	},

	
	registerPreferenceListeners: function(idArray) {
		idArray.forEach(element => {
			window.addEventListener("click", miczColumnsWizardPref2.onPreferenceChange, false);
		});
	},
	
	onPreferenceChange: function (event) {
		var targetElement = event.target;

		switch (targetElement.id) {
			case "ColumnsWizard.DefaultColsList.active_checkbox":
				miczColumnsWizardPrefsUtils.setBoolPref_CW("DefaultColsList.active", targetElement.checked);
				console.debug('SaveActive ' + targetElement.checked);
				break;
			case "cw_sort_asc":
			case "cw_sort_desc":
				break;
		
			default:
				break;
		}
	}
};




window.addEventListener("load", miczColumnsWizardPref2.settingsLoad, false);
