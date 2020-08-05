"use strict";

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
var { miczColumnsWizardPrefsUtils } = ChromeUtils.import("chrome://columnswizard/content/mzcw-prefsutils.jsm");
var { miczColumnsWizard_CustCols } = ChromeUtils.import("chrome://columnswizard/content/mzcw-customcolumns.js");
var { miczColumnsWizardPref_DefaultColsList } = ChromeUtils.import("chrome://columnswizard/content/mzcw-defaultcolslist.jsm");

var EXPORTED_SYMBOLS = ["miczColumnsWizardPref_CustomColsList"];

var miczColumnsWizardPref_CustomColsList = {

	window: null,
	document: null,
	customColsListObj: {},
	loadedCustCols: {},

	win: {},
	onEditCustomCol: {},

	// Bundled Custom Columns
	CustColDefaultIndex: ["cc", "bcc", "replyto", "xoriginalfrom", "contentbase", "xspamscore"],
	CreateDbObserver: [],

	
	initCustomColsList: function (window) {
		miczColumnsWizardPref_CustomColsList.window = window;
		miczColumnsWizardPref_CustomColsList.document = window.document;
		
		Services.scriptloader.loadSubScript("chrome://columnswizard/content/modules/list.controller2.js", window);

		var options = {
			//   valueNames: [ { data: ['date'] }, { data: ['description'] }, { data: ['yearly']} ],
			valueNames: ['enabled1', 'isSearchable1', 'index', 'dbHeader', 'title', 'tooltip',
				{ data: ['id'] },
				{ name: 'isBundled', attr: 'isBundled' },
				{ name: 'isCustom', attr: 'isCustom' },
				{ name: 'sortnumber', attr: 'sortnumber'},
				{ name: 'enabled', attr: 'checked' },
				{ name: 'isSearchable', attr: 'checked' },
				{ name: 'labelString', attr: 'labelString'},
				{ name: 'tooltipString', attr: 'tooltipString'},

			],
			item: '<tr class="list-row id" >\
			<td>\
				<label class="container">\
					<input type="checkbox" class="enabled toggle-action-enabled">\
					<span class="checkmark"></span>\
					</label>\
			</td>\
			<td >\
			<label class="container">\
					<input type="checkbox" class="isSearchable toggle-action-isSearchable">\
					<span class="checkmark"></span>\
					</label>\
			</td>\
			<td class="index"></td>\
			<td class="dbHeader"></td>\
			<td class="title"></td>\
			<td class="tooltip"></td>\
			</tr>',

		};

		// miczColumnsWizardPref_CustomColsList.customColsListObj = new miczColumnsWizardPref_CustomColsList.List('defaultColsListDiv', options);
		miczColumnsWizardPref_CustomColsList.customColsListObj = new window.List('customColsListDiv', options);

		var customColsList = miczColumnsWizardPref_CustomColsList.document.getElementById('customColsTable');
		customColsList.addEventListener('click', miczColumnsWizardPref_CustomColsList.onRowClick);

		miczColumnsWizardPref_CustomColsList.customColsListObj.controller = new window.ListController.ListController(miczColumnsWizardPref_CustomColsList.customColsListObj, null);


		// miczColumnsWizardPref_CustomColsList.customColsListObj.add({
		// 	'index': '10',
		// 	'dbHeader': 'X-Mozilla-xyz',
		// 	'title': 'XYZ',
		// 	tooltip: 'XYZ stuff',
		// });

		// miczColumnsWizardPref_CustomColsList.customColsListObj.add({
		// 	'index': '12',
		// 	'dbHeader': 'X-Mozilla-Tag',
		// 	'title': 'Tags',
		// 	tooltip: 'Tags',
		// });

		// miczColumnsWizardPref_CustomColsList.customColsListObj.add({
		// 	'index': '14',
		// 	'dbHeader': 'X-Mozilla-Christopher',
		// 	'title': 'Christopher',
		// 	tooltip: "Christopher's headers",
		// });



		// cleidigh temporary , custom, columnsTrip
		miczColumnsWizardPref_CustomColsList.loadedCustCols =
			 miczColumnsWizardPref_CustomColsList.loadedCustColPref = miczColumnsWizardPref_CustomColsList.loadCustCols();
		console.debug(miczColumnsWizardPref_CustomColsList.loadedCustCols);

		miczColumnsWizardPref_CustomColsList.createCustomColsListRows(miczColumnsWizardPref_CustomColsList.loadedCustCols);
		
		let checkedItems = miczColumnsWizardPref_CustomColsList.document.querySelectorAll('[checked]');
		for (const element of checkedItems) {
			// console.debug(element);
			// if (element.getAttribute("type") !== "checkbox" || element.getAttribute("type") !== "radio") {
			if (element.id.includes("tab")) {
				continue;
			}
			if (element.getAttribute("checked") !== "true") {
				element.removeAttribute("checked");
			} else {
				element.checked = true;
			}
		}

		console.debug('CC finish');
	},

	saveCustomColsList: function (idx) {
		console.debug('SaveCustom');

		// console.debug(miczColumnsWizardPref_CustomColsList.customColsListObj.list.outerHTML);
		var newCustomCols = {};

		// for (let index = 0; index < miczColumnsWizardPref_CustomColsList.customColsListObj.items.length; index++) {
			let index = idx;

			const item = miczColumnsWizardPref_CustomColsList.customColsListObj.items[index];
			var vals = item.values();
			// console.debug('values ' + vals);
			// console.debug('item ' + element.elm.outerHTML);
			newCustomCols[vals.index] = {};
		
			newCustomCols[vals.index].enabled = vals.enabled;
			newCustomCols[vals.index].isSearchable = vals.isSearchable;
			newCustomCols[vals.index].index = vals.index;
			newCustomCols[vals.index].dbHeader = vals.dbHeader;
			newCustomCols[vals.index].title = vals.title;
			newCustomCols[vals.index].def = vals.def;
			newCustomCols[vals.index].tooltip = vals.tooltip;
			newCustomCols[vals.index].isBundled = vals.isBundled;
			newCustomCols[vals.index].isCustom = vals.isCustom;
			newCustomCols[vals.index].sortnumber = vals.sortnumber;
			newCustomCols[vals.index].labelString = vals.labelString;
			newCustomCols[vals.index].tooltipString = vals.tooltipString;
		// }
		
		console.debug('new custom columns');
		console.debug(newCustomCols);

		miczColumnsWizard_CustCols.updateCustCol(newCustomCols[vals.index]);
	},


	loadCustCols: function () {
		/* let prefsc = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
		let prefs = prefsc.getBranch("extensions.ColumnsWizard.CustCols.");
		let prefs_def = prefsc.getBranch("extensions.ColumnsWizard.CustCols.def.");*/
		// let CustColIndexStr=prefs.getCharPref("index");
		let CustColIndexStr = miczColumnsWizardPrefsUtils.getCustColsIndex();
		let CustColIndex = [];
		if (CustColIndexStr === '') {
			// Set default CustColIndex
			CustColIndex = miczColumnsWizardPref_CustomColsList.CustColDefaultIndex;
			// prefs.setCharPref("index",JSON.stringify(CustColIndex));
			miczColumnsWizardPrefsUtils.setCustColsIndex(JSON.stringify(CustColIndex));
		} else {
			CustColIndex = miczColumnsWizardPref_CustomColsList.checkCustColDefaultIndex(JSON.parse(CustColIndexStr));
		}
		let loadedCustColPref = [];
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_CustomColsList] CustColIndex: "+JSON.stringify(CustColIndex)+"\r\n");
		miczColumnsWizardPref_CustomColsList.checkDefaultCustomColumnPrefs();
		for (let singlecolidx in CustColIndex) {
			// dump(">>>>>>>>>>>>> miczColumnsWizard->loadCustCols: [CustColIndex[singlecolidx]] "+CustColIndex[singlecolidx]+"\r\n");
			try {
				loadedCustColPref[CustColIndex[singlecolidx]] = JSON.parse(miczColumnsWizardPrefsUtils.getCustColDef(CustColIndex[singlecolidx]));
				if (loadedCustColPref[CustColIndex[singlecolidx]].isSearchable === undefined) {
					loadedCustColPref[CustColIndex[singlecolidx]].isSearchable = false;
				}
			} catch (ex) {
				// We have an index, but no preference for it, so we remove it...
				miczColumnsWizardPref_CustomColsList.removeCustColIndex(CustColIndex[singlecolidx]);
			}
		}
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_CustomColsList] loadedCustColPref: "+JSON.stringify(loadedCustColPref)+"\r\n");
		return loadedCustColPref;
	},


	createCustomColsListRows: function (CustColRows) {
		// sort cust cols by dbHeader
		let tmp_array = [];
		for (let index in CustColRows) {
			tmp_array.push(index);
		}
		tmp_array.sort(function (a, b) { return a < b ? -1 : (a > b ? 1 : 0); });

		var dindex = 1;

		for (let index in tmp_array) {
			this.createOneCustomColListRow(CustColRows[tmp_array[index]], dindex++);
		}
	},

	createOneCustomColListRow: function (currcol, index) {
		let _bundleCW = Services.strings.createBundle("chrome://columnswizard/locale/overlay.properties");

		let labelString = '';
		let tooltipString = '';
		if (currcol.isBundled) {
			labelString = _bundleCW.GetStringFromName("ColumnsWizard" + currcol.index + ".label");
			tooltipString = _bundleCW.GetStringFromName("ColumnsWizard" + currcol.index + "Desc.label");
		} else {
			labelString = currcol.labelString;
			tooltipString = currcol.tooltipString;
		}


		miczColumnsWizardPref_CustomColsList.customColsListObj.add({
			id: index,
			enabled: currcol.enabled,
			isSearchable: currcol.isSearchable,
			'index': currcol.index,
			'dbHeader': currcol.dbHeader,
			'title': labelString,
			def: currcol.def,
			tooltip: tooltipString,
			isBundled: currcol.isBundled,
			isCustom: currcol.isCustom,
			sortnumber: currcol.sortnumber,
			labelString: labelString,
			tooltipString: tooltipString,
		});

	},


	checkCustColDefaultIndex: function (curr_idx) {
		for (let idx in miczColumnsWizardPref_CustomColsList.CustColDefaultIndex) {
			if ( !curr_idx.includes(miczColumnsWizardPref_CustomColsList.CustColDefaultIndex[idx])) {
				curr_idx.push(miczColumnsWizardPref_CustomColsList.CustColDefaultIndex[idx]);
			}
		}
		// dump(">>>>>>>>>>>>> miczColumnsWizard->checkCustColDefaultIndex: curr_idx "+JSON.stringify(curr_idx)+"\r\n");
		return curr_idx;
	},

	checkDefaultCustomColumnPrefs: function () {
		/* let prefsc = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
		let prefs = prefsc.getBranch("extensions.ColumnsWizard.CustCols.");
		let prefs_def = prefsc.getBranch("extensions.ColumnsWizard.CustCols.def.");*/

		for (let singlecolidx in miczColumnsWizardPref_CustomColsList.CustColDefaultIndex) {
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [checkDefaultCustomColumnPrefs singlecolidx] "+miczColumnsWizardPref_CustomColsList.CustColDefaultIndex[singlecolidx]+" \r\n");
			let currcol = miczColumnsWizardPrefsUtils.getCustColDef(miczColumnsWizardPref_CustomColsList.CustColDefaultIndex[singlecolidx]);
			if (currcol === '') { // Default custom column pref not present
				let dcurrcol = {};
				switch (miczColumnsWizardPref_CustomColsList.CustColDefaultIndex[singlecolidx]) {
					case 'cc':
						dcurrcol.enabled = miczColumnsWizardPrefsUtils.getCustColBool("AddCc");
						dcurrcol.def = "AddCc";
						dcurrcol.dbHeader = "ccList";
						dcurrcol.sortnumber = false;
						dcurrcol.isCustom = false;
						dcurrcol.isSearchable = false;
						break;
					case 'bcc':
						dcurrcol.enabled = miczColumnsWizardPrefsUtils.getCustColBool("Addbcc");
						dcurrcol.def = "Addbcc";
						dcurrcol.dbHeader = "bccList";
						dcurrcol.sortnumber = false;
						dcurrcol.isCustom = false;
						dcurrcol.isSearchable = false;
						break;
					case 'replyto':
						dcurrcol.enabled = miczColumnsWizardPrefsUtils.getCustColBool("Addreplyto");
						dcurrcol.def = "Addreplyto";
						dcurrcol.dbHeader = "replyTo";
						dcurrcol.sortnumber = false;
						dcurrcol.isCustom = false;
						dcurrcol.isSearchable = true;
						break;
					case 'xoriginalfrom':
						dcurrcol.enabled = miczColumnsWizardPrefsUtils.getCustColBool("Addxoriginalfrom");
						dcurrcol.def = "Addxoriginalfrom";
						dcurrcol.dbHeader = "x-original-from";
						dcurrcol.sortnumber = false;
						dcurrcol.isCustom = true;
						dcurrcol.isSearchable = true;
						break;
					case 'contentbase':
						dcurrcol.enabled = miczColumnsWizardPrefsUtils.getCustColBool("Addcontentbase");
						dcurrcol.def = "Addcontentbase";
						dcurrcol.dbHeader = "content-base";
						dcurrcol.sortnumber = false;
						dcurrcol.isCustom = true;
						dcurrcol.isSearchable = true;
						break;
					case 'xspamscore':
						dcurrcol.enabled = false;
						dcurrcol.def = "";
						dcurrcol.dbHeader = "x-spam-score";
						dcurrcol.sortnumber = true;
						dcurrcol.isCustom = true;
						dcurrcol.isSearchable = true;
						break;
				}
				dcurrcol.index = miczColumnsWizardPref_CustomColsList.CustColDefaultIndex[singlecolidx];
				dcurrcol.isBundled = true;
				dcurrcol.labelString = '';
				dcurrcol.tooltipString = '';
				// prefs_def.setCharPref(miczColumnsWizardPref_CustomColsList.CustColDefaultIndex[singlecolidx],JSON.stringify(dcurrcol));
				miczColumnsWizardPrefsUtils.setCustColDef(miczColumnsWizardPref_CustomColsList.CustColDefaultIndex[singlecolidx], JSON.stringify(dcurrcol));
			}
		}
	},


	onRowClick: function (event, offset) {
		// console.debug(event);
		console.debug('Target ' + event.target.outerHTML);
		// console.debug(event.target.outerHTML);
		var selector = 'tr';
		var row = event.target.closest(selector);
		var idx = Number(row.getAttribute("data-id")) - 1;
		const item = miczColumnsWizardPref_CustomColsList.customColsListObj.items[idx];
		console.debug(item);
		
		if (event.target.classList.contains('toggle-action-enabled')) {
			console.debug('Show class');
			console.debug(`click: ${event.target.outerHTML}  : ${event.target.checked}`);
			if (!event.target.checked) {
				item.values({ "enabled": false });
				event.target.removeAttribute("checked");
			} else {
				item.values({ "enabled": true }, true);
			}
			event.stopPropagation();
			miczColumnsWizardPref_CustomColsList.saveCustomColsList(idx);
			console.debug('UpdatingDefaultList');
			miczColumnsWizardPref_DefaultColsList.updateDefaultColsList();
			return;
		}

		if (event.target.classList.contains('toggle-action-searchable')) {
			// console.debug('SortClass');
			// console.debug(`click: ${event.target.outerHTML}  : ${event.target.checked}`);
			if (!event.target.checked) {
				item.values({ "searchable": false });
				event.target.removeAttribute("checked");
				// console.debug('toggle false');
			} else {
				item.values({ "searchable": true });
			}

			// console.debug(item.values());
			// console.debug(item);
			// console.debug(lst.outerHTML);
			event.stopPropagation();
			miczColumnsWizardPref_CustomColsList.saveCustomColsList();
			console.debug('UpdatingDefaultList');
			miczColumnsWizardPref_DefaultColsList.updateDefaultColsList();
			
			return;
		}

	},
};
