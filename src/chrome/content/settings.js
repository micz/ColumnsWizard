/* List.js is required to make this table work. */

"use strict";

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
var { miczColumnsWizard_CustCols } = ChromeUtils.import("chrome://columnswizard/content/mzcw-customcolumns.js");
var { miczColumnsWizardPref_CustomColsGrid } = ChromeUtils.import("chrome://columnswizard/content/mzcw-customcolsgrid.jsm");
var { miczColumnsWizardPref_CustomColsList } = ChromeUtils.import("chrome://columnswizard/content/mzcw-customcolslist.jsm");
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
		
		miczColumnsWizardPref_CustomColsList.initCustomColsList(window);


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
			// miczColumnsWizardPref_CustomColsGrid.createOneCustomColRow(doc, container, args.newcol);
			// Select the new custcols, it is at the end of the list.
			// container.selectedIndex = container.itemCount - 1;
			// container.ensureIndexIsVisible(container.selectedIndex);

			const index = miczColumnsWizardPref_CustomColsList.customColsListObj.items.length;

			miczColumnsWizardPref_CustomColsList.customColsListObj.add({
				id: index,
				enabled: args.newcol.enabled,
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

		const item = miczColumnsWizardPref_CustomColsList.customColsListObj.items[Number(selectedID) - 1];
		var vals = item.values();
		var index = vals.index;
		if (vals.isBundled) {
			alert("Cannot edit bundled custom column");
			return;
		}
		// let args = { "action": "edit", "args.newcol": JSON.stringify(container.selectedItem._customcol) };
		let args = { "action": "edit", "currcol": JSON.stringify(vals) };

		window.openDialog("chrome://columnswizard/content/mzcw-settings-customcolseditor.xul", "CustColsEditor", "chrome,modal,titlebar,resizable,centerscreen", args);

		console.debug('after window close');
		console.debug(args);
		if (("save" in args && args.save) && ("newcol" in args && args.newcol)) {
			// save the cust col in the pref
			console.debug('SavingAntigenDefault');
			console.debug(args.newcol);
			miczColumnsWizard_CustCols.updateCustCol(args.newcol);

			// update the cust col in the list

			item.values({
				id: index,
				enabled: args.newcol.enabled,
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
	

			// miczColumnsWizardPref_CustomColsGrid.editOneCustomColRow(doc, container, args.newcol, container.selectedIndex);
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

		
		
		
		// get the col id
		let col_idx = index;
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [onDeleteCustomCol] col_idx ["+col_idx+"]\r\n");

		// delete the custom col
		let ObserverService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
		// miczColumnsWizard_CustCols.removeCustomColumn(col_idx,ObserverService)
		// miczColumnsWizard_CustCols.deleteCustCol(col_idx);
		ObserverService.notifyObservers(null, "CW-deleteCustomColumn", col_idx);

		// remove the custom col from the list
		miczColumnsWizardPref_CustomColsList.customColsListObj.remove("id", selectedID);

		// miczColumnsWizardPref_CustomColsGrid.deleteOneCustomColRow(container, container.selectedIndex);
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
