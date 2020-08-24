/* List.js is required to make this table work. */

"use strict";

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
var { miczColumnsWizard_CustCols } = ChromeUtils.import("chrome://columnswizard/content/mzcw-customcolumns.js");
var { miczColumnsWizardPref_CustomColsList } = ChromeUtils.import("chrome://columnswizard/content/mzcw-customcolslist.jsm");
var { miczColumnsWizardPref_DefaultColsList } = ChromeUtils.import("chrome://columnswizard/content/mzcw-defaultcolslist.jsm");
var { miczColumnsWizardPrefsUtils } = ChromeUtils.import("chrome://columnswizard/content/mzcw-prefsutils.jsm");
var { DocLocalize } = ChromeUtils.import("chrome://columnswizard/content/doc-localize.jsm");

// var miczColumnsWizard = window.opener.miczColumnsWizard;
var miczColumnsWizard = window.miczColumnsWizard;
var defaultColsListObj;

var miczColumnsWizardPref2 = {};

miczColumnsWizardPref2 = {

	prefList: [
		{docid: "ColumnsWizard.DefaultColsList.active_checkbox", pref: "ColumnsWizard.DefaultColsList.active", type: "boolean_checkbox", prefPostOp: null, prefListener: miczColumnsWizardPref2.onPreferenceChange},
		{docid: "ColumnsWizard.CustCols.mod_active_checkbox", pref: "ColumnsWizard.CustCols.mod_active", type: "boolean_checkbox", prefPostOp: null, prefListener: this.onPreferenceChange},
		{docid: "ColumnsWizard.debug_checkbox", pref: "ColumnsWizard.debug", type: "boolean_checkbox", prefPostOp: null, prefListener: this.onPreferenceChange},
		{docid: "ColumnsWizard.ShowLocation_checkbox", pref: "ColumnsWizard.ShowLocation", type: "boolean_checkbox", prefPostOp: null, prefListener: this.onPreferenceChange},
		{docid: "ColumnsWizard.ShowAccount_checkbox", pref: "ColumnsWizard.ShowAccount", type: "boolean_checkbox", prefPostOp: null, prefListener: this.onPreferenceChange},
		{docid: "ColumnsWizard.ShowAttachment_checkbox", pref: "ColumnsWizard.ShowAttachment", type: "boolean_checkbox", prefPostOp: null, prefListener: this.onPreferenceChange},
		{docid: "ColumnsWizard.ShowRecipient_checkbox", pref: "ColumnsWizard.ShowRecipient", type: "boolean_checkbox", prefPostOp: null, prefListener: this.onPreferenceChange},
		{docid: "ColumnsWizard.MailHeader.use_imap_fix_checkbox", pref: "ColumnsWizard.MailHeader.use_imap_fix_checkbox", type: "boolean_checkbox", prefPostOp: null, prefListener: this.onPreferenceChange},
		{docid: "ColumnsWizard.MailHeader.put_original_in_trash_checkbox", pref: "ColumnsWizard.MailHeader.put_original_in_trash", type: "boolean_checkbox", prefPostOp: null, prefListener: this.onPreferenceChange},
		{docid: "ColumnsWizard.cw_sort_asc", pref: "", type: "boolean_radio", prefPostOp: null, prefListener: miczColumnsWizardPref2.onPreferenceChange},
		{docid: "ColumnsWizard.cw_sort_desc", pref: "", type: "boolean_radio", prefPostOp: null, prefListener: miczColumnsWizardPref2.onPreferenceChange},
	],

	
	// {docid: "ColumnsWizard.DefaultColsList.active_checkbox", pref: "ColumnsWizard.DefaultColsList.active_checkbox.active", type: "boolean_checkbox", prefPostOp: null},

	// {docid: "ColumnsWizard.ColumnsWizard.cw_sort_asc", pref: "ColumnsWizard.", type: "boolean", prefPostOp: null},

	// {docid: "ColumnsWizard.", pref: "ColumnsWizard.", type: "boolean_checkbox", prefPostOp: null, prefListener: this.onPreferenceChange},

	docSettingsLoad: function () {
		this.prefList.forEach(prefEntry => {
			// console.debug(prefEntry);
			var prefElement = document.getElementById(prefEntry.docid);
			switch (prefEntry.type) {
				case 'boolean_checkbox':
					let pref = miczColumnsWizardPrefsUtils.getBoolPref("extensions." + prefEntry.pref);
					// console.debug('BooleanCheckBox: ' + pref);
					prefElement.checked = pref;
					if (!pref) {
						prefElement.removeAttribute("checked");
					}

					break;
			
				default:
					break;
			}
			miczColumnsWizardPref2.registerPreferenceListener(prefEntry);
		});
	},

	htmlToElements: function (html) {
		var domParser = new DOMParser();
		domParser.forceEnableXULXBL();
		var docFragment = domParser.parseFromString(html, 'text/html');
		// console.debug(docFragment.body.firstChild.outerHTML);
		return docFragment.body.firstChild;
	},

	settingsLoad: async function () {

		await DocLocalize.loadLocaleMessages(document, "messages.json");
		console.debug('SettingsLive');
		miczColumnsWizardPref2.docSettingsLoad();

		var cbelement = document.getElementById("ColumnsWizard.DefaultColsList.active_checkbox");
/* 		let dca = miczColumnsWizardPrefsUtils.getBoolPref_CW("DefaultColsList.active");

		if (dca) {
			cbelement.checked = true;
		} else {
			cbelement.removeAttribute("checked");
		}
		
		cbelement = document.getElementById("ColumnsWizard.CustCols.mod_active_checkbox");
		dca = miczColumnsWizardPrefsUtils.getBoolPref_CW("CustCols.mod_active");
		if (dca) {
			cbelement.checked = true;
		} else {
			cbelement.removeAttribute("checked");
		}
		
 */
		cbelement = document.getElementById("ColumnsWizard.cw_sort_asc");
		var cbelement2 = document.getElementById("ColumnsWizard.cw_sort_desc");
		let so = miczColumnsWizardPrefsUtils.getIntPref("mailnews.default_sort_order");
		console.debug(`SortOrderOn Load ${so}`);
		// console.debug(`SortTypeOnReset ${st}`);


		if (so === 1) {
			cbelement.checked = true;
			cbelement2.removeAttribute("checked");
		} else {
			cbelement.removeAttribute("checked");
			cbelement2.checked = true;
		}
		

		// Services.scriptloader.loadSubScript("chrome://columnswizard/content/modules/list.js", {});
		// var  { List2 } = ChromeUtils.import("chrome://columnswizard/content/modules/list.js", this);
		// var ListObj = new List1.List('defaultColsListDiv');
		// console.debug(ListObj);
		console.debug('Start');


		miczColumnsWizardPref_DefaultColsList.initDefaultColsList(window);
		
		miczColumnsWizardPref_CustomColsList.initCustomColsList(window);

		// Load release notes
		miczColumnsWizardPref2.loadInfoFile('release_notes');

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



	loadCustColRows: function (win) {
		let doc = win.document;
		let container = doc.getElementById('ColumnsWizard.CustColsList');
		miczColumnsWizardPref_CustomColsList.createCustomColsListRows(doc, container);
	},


	
	onNewCustomCol: function (win) {
		let doc = win.document;
		let container = doc.getElementById('ColumnsWizard.CustColsList');
		let args = { "action": "new" };

		window.openDialog("chrome://columnswizard/content/mzcw-settings-customcolseditor.xul", "CustColsEditor", "chrome,modal,titlebar,resizable,centerscreen", args);

		if (("save" in args && args.save) && ("newcol" in args && args.newcol)) {
			miczColumnsWizard_CustCols.addNewCustCol(args.newcol);
			console.debug(args.newcol);

			// Select the new custcols, it is at the end of the list.
			// container.selectedIndex = container.itemCount - 1;
			// container.ensureIndexIsVisible(container.selectedIndex);

			const index = miczColumnsWizardPref_CustomColsList.customColsListObj.items.length + 1;
			console.debug('NewIndex ' + index);
			miczColumnsWizardPref_CustomColsList.customColsListObj.add({
				id: index,
				enabled: args.newcol.enabled,
				isEditable: args.newcol.isEditable,
				isSearchable: args.newcol.isSearchable,
				'index': args.newcol.index,
				'dbHeader': args.newcol.dbHeader,
				'title': args.newcol.labelString,
				def: args.newcol.def,
				tooltip: args.newcol.tooltipString,
				isBundled: args.newcol.isBundled,
				isCustom: args.newcol.isCustom,
				sortnumber: args.newcol.sortnumber,
				labelString: args.newcol.labelString,
				tooltipString: args.newcol.tooltipString,
			});
	
		}

		miczColumnsWizardPref_DefaultColsList.toggleCustomCol(args.newcol);
	},

	onEditCustomCol: function (win) {
		let doc = win.document;
		// let container = doc.getElementById('ColumnsWizard.CustColsList');

		// if (container.selectedIndex === -1) return;
		// if (doc.getElementById("editButton").disabled) return;

		var selectedID = miczColumnsWizardPref_CustomColsList.customColsListObj.controller.getSelectedRowDataId();
		console.debug(selectedID);
		if (!selectedID || selectedID === -1) {
			console.debug('no select');
			return;
		}

		var item = miczColumnsWizardPref_CustomColsList.customColsListObj.items[Number(selectedID) - 1];
		var vals = item.values();
		var index = vals.index;
		if (vals.isBundled) {
			alert("Cannot edit bundled custom column");
			return;
		}
		// let args = { "action": "edit", "args.newcol": JSON.stringify(container.selectedItem._customcol) };

		let	custCol = miczColumnsWizardPref_DefaultColsList.loadedCustCols[item.values().index];
		console.debug(custCol);
		// let args = { "action": "edit", "currcol": JSON.stringify(vals) };
		let args = { "action": "edit", "currcol": JSON.stringify(custCol) };

		window.openDialog("chrome://columnswizard/content/mzcw-settings-customcolseditor.xul", "CustColsEditor", "chrome,modal,titlebar,resizable,centerscreen", args);

		console.debug('after window close');
		console.debug(args);
		if (("save" in args && args.save) && ("newcol" in args && args.newcol)) {
			// save the cust col in the pref
			console.debug('Saving edited column');
			console.debug(args.newcol);

			miczColumnsWizard_CustCols.updateCustCol(args.newcol);
			miczColumnsWizardPref_DefaultColsList.loadedCustCols = miczColumnsWizard_CustCols.loadCustCols();
			console.debug('NewLoaded');
			console.debug(miczColumnsWizardPref_DefaultColsList.loadedCustCols);
			// update the cust col in the list

			item.values({
				id: vals.id,
				enabled: args.newcol.enabled,
				isEditable: args.newcol.isEditable,
				isSearchable: args.newcol.isSearchable,
				'index': args.newcol.index,
				'dbHeader': args.newcol.dbHeader,
				'title': args.newcol.labelString,
				def: args.newcol.def,
				tooltip: args.newcol.tooltipString,
				isBundled: args.newcol.isBundled,
				isCustom: args.newcol.isCustom,
				sortnumber: args.newcol.sortnumber,
				labelString: args.newcol.labelString,
				tooltipString: args.newcol.tooltipString,
			});
	

			// Select the editedcustcols
			// container.ensureIndexIsVisible(container.selectedIndex);
		}

	},

	
	onDeleteCustomCol: function (win) {
		let doc = win.document;

		// let container = doc.getElementById('ColumnsWizard.CustColsList');

		// if (container.selectedIndex === -1) return;
		// if (doc.getElementById("deleteButton").disabled) return;

		var selectedID = miczColumnsWizardPref_CustomColsList.customColsListObj.controller.getSelectedRowDataId();
		console.debug(selectedID);
		if (!selectedID || selectedID === -1) {
			console.debug('no select');
			return;
		}

		const item = miczColumnsWizardPref_CustomColsList.customColsListObj.items[Number(selectedID) - 1];
		var vals = item.values();
		var index = vals.index;

		if (vals.isBundled) {
			alert("Cannot delete bundled custom column");
			return;
		}
		
		// Are you sure?
		let prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
		let _bundleCW = Services.strings.createBundle("chrome://columnswizard/locale/settings.properties");

		if (!prompts.confirm(null, _bundleCW.GetStringFromName("ColumnsWizard.deletePrompt.title"), _bundleCW.GetStringFromName("ColumnsWizard.deletePrompt.text"))) return;
		console.debug('DeleteCustom');
		console.debug(vals);


		// get the col id
		let col_idx = index;
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [onDeleteCustomCol] col_idx ["+col_idx+"]\r\n");

		// delete the custom col
		let ObserverService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
		// miczColumnsWizard_CustCols.removeCustomColumn(col_idx,ObserverService)
		// miczColumnsWizard_CustCols.deleteCustCol(col_idx);
		
		vals.enabled = false;
		miczColumnsWizardPref_DefaultColsList.toggleCustomCol(vals);
		miczColumnsWizardPref_DefaultColsList.saveDefaultColsList();
		// miczColumnsWizardPref_DefaultColsList.loadDefaultColRows_Pref();

		ObserverService.notifyObservers(null, "CW-deleteCustomColumn", col_idx);

		// remove the custom col from the list
		miczColumnsWizardPref_CustomColsList.customColsListObj.remove("id", selectedID);

	},

	
	registerPreferenceListeners: function(idArray) {
		idArray.forEach(element => {
			window.addEventListener("click", miczColumnsWizardPref2.onPreferenceChange, false);
		});
	},
	
	registerPreferenceListener: function(prefEntry) {
		let element = document.getElementById(prefEntry.docid);
		if (prefEntry.prefListener) {
			element.addEventListener("click", prefEntry.prefListener, false);
		} else {
			element.addEventListener("click", miczColumnsWizardPref2.onPreferenceChange, false);
		}
	},
	
	onPreferenceChange: function (event) {
		var targetElement = event.target;

		var prefEntry = miczColumnsWizardPref2.prefList.find(x => x.docid === targetElement.id);
		console.debug(targetElement.id);
		console.debug(prefEntry);

		if (!prefEntry) {
			return;
		}
		
		switch (prefEntry.type) {
			case 'boolean_checkbox':
				miczColumnsWizardPrefsUtils.setBoolPref("extensions." + prefEntry.pref, targetElement.checked);
				console.debug('BooleanCheckBox: ' + targetElement.checked);
				// if (!pref) {
				// 	prefElement.removeAttribute("checked");
				// }

				break;
			case 'boolean_radio':
				if (targetElement.id === "ColumnsWizard.cw_sort_asc" || targetElement.id === "ColumnsWizard.cw_sort_desc") {
					let cbelement = document.getElementById("ColumnsWizard.cw_sort_asc");
					let sort_order = cbelement.checked ? 1 : 2;
					miczColumnsWizardPrefsUtils.setIntPref("mailnews.default_sort_order", sort_order);
					console.debug(`New sort order ${sort_order}`);
				}
			
			default:
				break;
		}
		
/* 
		switch (targetElement.id) {
			case "ColumnsWizard.DefaultColsList.active_checkbox":
				miczColumnsWizardPrefsUtils.setBoolPref_CW("DefaultColsList.active", targetElement.checked);
				console.debug('SaveActive ' + targetElement.checked);
				break;
			case "ColumnsWizard.cw_sort_asc":
			case "ColumnsWizard.cw_sort_desc":
				let cbelement = document.getElementById("ColumnsWizard.cw_sort_asc");
				miczColumnsWizardPrefsUtils.setBoolPref("mailnews.default_sort_order", cbelement.checked);
				break;
			case "ColumnsWizard.debug_checkbox":
				miczColumnsWizardPrefsUtils.setBoolPref_CW("debug", targetElement.checked);
				break;
			default:
				break;
		}
 */
	},

	loadInfoFile: function (filetype) {
		let url = '';
		switch (filetype) {
			case 'release_notes':
				url = "chrome://cwrl/content/CHANGELOG.md";
				break;
			case 'license':
				url = "chrome://cwrl/content/LICENSE";
				break;
		}
		let request = new XMLHttpRequest();
		request.responseType = "text";
		console.debug('load fileThomas');
		request.addEventListener("load", function () {
			let relnotes = document.getElementById('mzcw-release-notes');
			relnotes.textContent = this.responseText;
		});
		request.open("GET", url);
		request.send();
	},
};




window.addEventListener("load", miczColumnsWizardPref2.settingsLoad, false);
