"use strict";

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
var { miczColumnsWizardPref_CustomColsGrid } = ChromeUtils.import("chrome://columnswizard/content/mzcw-customcolsgrid.jsm");
var { miczColumnsWizardPref_DefaultColsGrid } = ChromeUtils.import("chrome://columnswizard/content/mzcw-defaultcolsgrid.jsm");
var { miczColumnsWizardPrefsUtils } = ChromeUtils.import("chrome://columnswizard/content/mzcw-prefsutils.jsm");

var miczColumnsWizard = window.opener.miczColumnsWizard;
var miczColumnsWizardPref = {

	onLoad: function (win) {
		win = window;
		// temporary preference Fixup
		this.fixupPreferences(win);

		this.loadCustColRows(win);

		// Load release notes
		this.loadInfoFile('release_notes');

		// Fixing window height
		sizeToContent();
		var vbox = document.getElementById('cw_tabbox');
		vbox.height = vbox.boxObject.height;
		sizeToContent();

		this.loadDefaultColRows(win);

		miczColumnsWizardPref_CustomColsGrid.miczColumnsWizard_CustCols = miczColumnsWizard_CustCols;
		miczColumnsWizardPref_CustomColsGrid.win = win;
		miczColumnsWizardPref_CustomColsGrid.onEditCustomCol = miczColumnsWizardPref.onEditCustomCol;
	},

	fixupPreferences: function(win) {
		// console.debug('FixupPreferences');
		// Services.console.logStringMessage(" fixup preferences");
		var preferenceElements = document.getElementsByTagName("preference");
		for (let pelement of preferenceElements)  {
			let preferenceId = pelement.getAttribute("id");
			let preferenceName = pelement.getAttribute("name");
			let preferenceType = pelement.getAttribute("type");
			let preferences  = document.querySelectorAll(`[preference="${preferenceId}"]`);
			for (let element of preferences) {
				// console.debug(element.outerHTML);
				var pref;
				switch (preferenceType) {
					case 'bool':
						pref = miczColumnsWizardPrefsUtils.getBoolPref(preferenceName);
						element.value = pref;
						if (pref) {
							element.setAttribute("checked", "true");
						} else {
							element.removeAttribute("checked");
						}
						Services.console.logStringMessage(`lP: ${preferenceId} : ${pref}`);
						break;
					case 'int':
						pref = miczColumnsWizardPrefsUtils.getIntPref(preferenceName);
						element.value = pref;
						Services.console.logStringMessage(`lP: ${preferenceId} : ${pref}`);
						break;
					case 'string':
						pref = miczColumnsWizardPrefsUtils.getCharPref(preferenceName);
						element.value = pref;
						Services.console.logStringMessage(`lP: ${preferenceId} : ${pref}`);
						break;
					default:
						break;
				}

			}
		}
	},

	savePreferences: function(win) {
		// Services.console.logStringMessage("save preferences");
		var preferenceElements = document.getElementsByTagName("preference");
		for (let pelement of preferenceElements)  {
			let preferenceId = pelement.getAttribute("id");
			let preferenceName = pelement.getAttribute("name");
			let preferenceType = pelement.getAttribute("type");
			let preferences  = document.querySelectorAll(`[preference="${preferenceId}"]`);
			for (let element of preferences) {
				// console.debug(element.outerHTML);
				var pref;
				switch (preferenceType) {
					case 'bool':
						pref = element.checked;
						if (!pref) {
							pref = false;
						}
						miczColumnsWizardPrefsUtils.setBoolPref(preferenceName, pref);
						Services.console.logStringMessage(`sP: ${preferenceId} : ${pref}`);
						break;
					case 'int':
						pref = element.value;
						miczColumnsWizardPrefsUtils.setIntPref(preferenceName, pref);
						Services.console.logStringMessage(`sP: ${preferenceId} : ${pref}`);
						break;
					case 'string':
						pref = element.value;
						miczColumnsWizardPrefsUtils.setCharPref(preferenceName, pref);
						Services.console.logStringMessage(`sP: ${preferenceId} : ${pref}`);
						break;
					default:
						break;
				}

			}
		}
		let defaultcols = this.saveDefaultColRows(win);
		Services.console.logStringMessage(`SaveDefaultC : ${defaultcols}`);
	},

	loadDefaultColRows: function (win) {
		let doc = win.document;
		let container = doc.getElementById('ColumnsWizard.DefaultColsGrid');
		miczColumnsWizardPref_DefaultColsGrid.loadedCustCols = miczColumnsWizard_CustCols.loadCustCols();
		miczColumnsWizardPref_DefaultColsGrid.createDefaultColsGridHeader(doc, container);
		miczColumnsWizardPref_DefaultColsGrid.createDefaultColsGridRows(doc, container);
	},

	saveDefaultColRows: function (win) {
		// let doc = win.document;
		let doc = document;
		let container = doc.getElementById('ColumnsWizard.DefaultColsGrid');
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref] saveDefaultColRows called\r\n");
		return miczColumnsWizardPref_DefaultColsGrid.saveDefaultColsGridRows(doc, container, true);
	},

	loadCustColRows: function (win) {
		let doc = win.document;
		let container = doc.getElementById('ColumnsWizard.CustColsList');
		miczColumnsWizardPref_CustomColsGrid.createCustomColsListRows(doc, container, miczColumnsWizard_CustCols.loadCustCols());
	},

	updateButtons: function (win) {
		let doc = win.document;
		let currlist = doc.getElementById('ColumnsWizard.CustColsList');
		let numSelected = currlist.selectedItems.length;
		let oneSelected = (numSelected === 1);
		if (oneSelected) {
			// if it's a bundled item, we can not modify or delete it!
			let currcol = miczColumnsWizardPref_CustomColsGrid.currentCustomCol(currlist);
			let btnDisabled = currcol.isBundled;
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [updateButtons] currlist.selectedItem "+JSON.stringify(currcol)+"\r\n");
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [updateButtons] col_index {"+currcol.index+"}\r\n");
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [updateButtons] btnDisabled {"+btnDisabled+"}\r\n");
			doc.getElementById("editButton").disabled = btnDisabled;
			doc.getElementById("deleteButton").disabled = btnDisabled;
		}
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [updateButtons] currlist num selected {"+numSelected+"}\r\n");
	},

	onNewCustomCol: function (win) {
		let doc = win.document;
		let container = doc.getElementById('ColumnsWizard.CustColsList');
		let args = { "action": "new" };

		window.openDialog("chrome://columnswizard/content/mzcw-settings-customcolseditor.xul", "CustColsEditor", "chrome,modal,titlebar,resizable,centerscreen", args);

		if (("save" in args && args.save) && ("newcol" in args && args.newcol)) {
			miczColumnsWizard_CustCols.addNewCustCol(args.newcol);
			miczColumnsWizardPref_CustomColsGrid.createOneCustomColRow(doc, container, args.newcol);
			// Select the new custcols, it is at the end of the list.
			container.selectedIndex = container.itemCount - 1;
			container.ensureIndexIsVisible(container.selectedIndex);
		}

	},

	onEditCustomCol: function (win) {
		let doc = win.document;
		let container = doc.getElementById('ColumnsWizard.CustColsList');

		if (container.selectedIndex === -1) return;
		if (doc.getElementById("editButton").disabled) return;

		let args = { "action": "edit", "currcol": JSON.stringify(container.selectedItem._customcol) };

		window.openDialog("chrome://columnswizard/content/mzcw-settings-customcolseditor.xul", "CustColsEditor", "chrome,modal,titlebar,resizable,centerscreen", args);

		if (("save" in args && args.save) && ("newcol" in args && args.newcol)) {
			// save the cust col in the pref
			miczColumnsWizard_CustCols.updateCustCol(args.newcol);
			// update the cust col in the listbox
			miczColumnsWizardPref_CustomColsGrid.editOneCustomColRow(doc, container, args.newcol, container.selectedIndex);
			// Select the editedcustcols
			container.ensureIndexIsVisible(container.selectedIndex);
		}

	},

	onDeleteCustomCol: function (win) {
		let doc = win.document;
		let container = doc.getElementById('ColumnsWizard.CustColsList');

		if (container.selectedIndex === -1) return;
		if (doc.getElementById("deleteButton").disabled) return;

		// Are you sure?
		let prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
		let _bundleCW = Services.strings.createBundle("chrome://columnswizard/locale/settings.properties");

		if (!prompts.confirm(null, _bundleCW.GetStringFromName("ColumnsWizard.deletePrompt.title"), _bundleCW.GetStringFromName("ColumnsWizard.deletePrompt.text"))) return;

		// get the col id
		let col_idx = container.selectedItem._customcol.index;
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [onDeleteCustomCol] col_idx ["+col_idx+"]\r\n");

		// delete the custom col
		let ObserverService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
		// miczColumnsWizard_CustCols.removeCustomColumn(col_idx,ObserverService)
		// miczColumnsWizard_CustCols.deleteCustCol(col_idx);
		ObserverService.notifyObservers(null, "CW-deleteCustomColumn", col_idx);

		// remove the custom col from the listbox
		miczColumnsWizardPref_CustomColsGrid.deleteOneCustomColRow(container, container.selectedIndex);
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
		request.addEventListener("load", function () {
			let relnotes = document.getElementById('mzcw-release-notes');
			relnotes.value = this.responseText;
		});
		request.open("GET", url);
		request.send();
	},
};

document.addEventListener("dialogaccept", function (event) {
	miczColumnsWizardPref.savePreferences();
});

window.addEventListener("load", function (event) {
	miczColumnsWizardPref.onLoad();
});

