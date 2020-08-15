"use strict";

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
var { miczColumnsWizardPrefsUtils } = ChromeUtils.import("chrome://columnswizard/content/mzcw-prefsutils.jsm");
var { miczColumnsWizard_CustCols } = ChromeUtils.import("chrome://columnswizard/content/mzcw-customcolumns.js");
var EXPORTED_SYMBOLS = ["miczColumnsWizardPref_DefaultColsList"];

const colClass = 'cw-col-class';

var miczColumnsWizardPref_DefaultColsList = {

	loadedCustCols: {},
	window: null,
	document: null,
	defaultColsListObj: {},

	initDefaultColsList: function (window) {
		miczColumnsWizardPref_DefaultColsList.window = window;
		miczColumnsWizardPref_DefaultColsList.document = window.document;
		var context = {};
		
		miczColumnsWizardPref_DefaultColsList.loadedCustCols = miczColumnsWizard_CustCols.loadCustCols();
		
		context.window = miczColumnsWizardPref_DefaultColsList.window;

		Services.scriptloader.loadSubScript("chrome://columnswizard/content/modules/list.controller2.js", window);

		var options = {
			//   valueNames: [ { data: ['date'] }, { data: ['description'] }, { data: ['yearly']} ],
			valueNames: ['show1', 'sort_by1', 'name', 'move_up', 'move_down',
				{ data: ['id'] },
				{ data: ['currindex'] },
				{ name: 'show', attr: 'checked' },
				{ name: 'sort_by', attr: 'checked' },
			],
			item: '<tr class="list-row id" >\
			<td>\
				<label class="container">\
					<input type="checkbox" class="show toggle-action-show">\
					<span class="checkmark"></span>\
					</label>\
			</td>\
			<td >\
			<label class="container">\
					<input type="radio" class="sort_by toggle-action-sort-by" name="sortRadioGroup">\
					<span class="rcheckmark"></span>\
					</label>\
			</td>\
			<td class="name"></td>\
			<td class="move_up up-action" >\
			</td>\
			<td class="move_down down-action">\
			</td>\
			</tr>',

		};

		// miczColumnsWizardPref_DefaultColsList.defaultColsListObj = new miczColumnsWizardPref_DefaultColsList.List('defaultColsListDiv', options);
		miczColumnsWizardPref_DefaultColsList.defaultColsListObj = new window.List('defaultColsListDiv', options);

		var defaultColsList = miczColumnsWizardPref_DefaultColsList.document.getElementById('defaultColsTable');
		defaultColsList.addEventListener('click', miczColumnsWizardPref_DefaultColsList.onRowClick);

		miczColumnsWizardPref_DefaultColsList.defaultColsListObj.controller = new window.ListController.ListController(miczColumnsWizardPref_DefaultColsList.defaultColsListObj, null);

		this.updateDefaultColsList();
	},

	updateDefaultColsList: function () {
		console.debug('UpdateDefault');
		
		miczColumnsWizardPref_DefaultColsList.loadedCustCols = miczColumnsWizard_CustCols.loadCustCols();

		var dindex = 1;

		miczColumnsWizardPref_DefaultColsList.loadDefaultColRows_Pref();
		var defaultColsObj = miczColumnsWizardPref_DefaultColsList.sortDefaultColsList();
		var defaultCols = defaultColsObj.defaultCols;
		var sorted_cols = defaultColsObj.sorted_cols;

		var sortcolindex = miczColumnsWizardPrefsUtils.getIntPref("mailnews.default_sort_type");
		console.debug('sort indextype ' + sortcolindex);

		console.debug(defaultCols);
		var sb;
		for (let index in sorted_cols) {
			var element = defaultCols[sorted_cols[index][0]];
			if (1) {
				// const element = defaultCols[colId];
				// console.debug('Check ' + sortcolindex + '  ' + miczColumnsWizardPref2.getSortType(element.currindex));
				if (sortcolindex === miczColumnsWizardPref_DefaultColsList.getSortType(element.currindex)) {
					// col_sortby.setAttribute("selected", true);
					sb = true;
				} else {
					sb = false;
				}
				// console.debug(colId);
				// console.debug( element );
				// console.debug( element.visible );
				// console.1debug( element.sort_by);
				// let sb = element.sort_by ? "true" : "false";
				// console.debug(sb);
				miczColumnsWizardPref_DefaultColsList.defaultColsListObj.add({
					currindex: element.currindex,
					show: element.visible,
					sort_by: sb,
					name: miczColumnsWizardPref_DefaultColsList.getColLocalizedString(element.currindex),
					move_up: '<img src="chrome://columnswizard/content/ico/arrow-up-black-64px.png" height="16px" width="16px" class="arrows up-action" title="Move Up">',
					move_down: '<img src="chrome://columnswizard/content/ico/arrow-down-black-64px.png" height="16px" width="16px" class="arrows down-action">',
					id: dindex++,
				});


			}
		}

		let checkedItems = miczColumnsWizardPref_DefaultColsList.document.querySelectorAll('[checked]');
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

	},

	saveDefaultColsList: function () {
		console.debug('SaveDefault');
		// console.debug(tableList.items);
		var newDefaultCols = {};
		let ordinal = 1;

		for (let index = 0; index < miczColumnsWizardPref_DefaultColsList.defaultColsListObj.items.length; index++) {
			const element = miczColumnsWizardPref_DefaultColsList.defaultColsListObj.items[index];
			var vals = element.values();
			// console.debug('values ' + vals);
			// console.debug('item ' + element.elm.outerHTML);
			newDefaultCols[vals.currindex] = {};
			newDefaultCols[vals.currindex].currindex = vals.currindex;
			newDefaultCols[vals.currindex].visible = vals.show;
			newDefaultCols[vals.currindex].ordinal = ordinal;
			console.debug('SaveSort ' + vals.sort_by);
			if (vals.sort_by) {
				let ci = miczColumnsWizardPrefsUtils.getIntPref("mailnews.default_sort_type");
				console.debug('CurrentSort ' + ci );
				let so =  miczColumnsWizardPref_DefaultColsList.getSortType(vals.currindex);
				// console.debug('cO ' +  miczColumnsWizardPref2.getSortType(vals.currindex));
				console.debug(so);

				let sortcolindex = miczColumnsWizardPrefsUtils.setIntPref("mailnews.default_sort_type", so);
				ci = miczColumnsWizardPrefsUtils.getIntPref("mailnews.default_sort_type");
				console.debug('NewSort ' + ci);
				
				// let sortcolindex = miczColumnsWizardPrefsUtils.setIntPref("mailnews.default_sort_type", miczColumnsWizardPref_DefaultColsGrid.getSortType(vals.currindex));
				// console.debug(vals.sort_by,);
				// console.debug(sortcolindex);
		}
			// newDefaultCols[elemWeent.currindex].
			
			// console.debug(element.values());
			ordinal += 2;
			
		}

		let cbelement = miczColumnsWizardPref_DefaultColsList.document.getElementById("ColumnsWizard.DefaultColsList.active_checkbox");
		let dca = cbelement.checked;
		miczColumnsWizardPrefsUtils.setBoolPref_CW("DefaultColsList.active", dca);

		// console.debug(newDefaultCols);
		console.debug('F SaveDefault');
		miczColumnsWizardPrefsUtils.setCharPref_CW("DefaultColsList", JSON.stringify(newDefaultCols));
		return newDefaultCols;
	},

	toggleCustomCol: function (col) {
		console.debug('Toggleitem');
		console.debug(col);
		console.debug(miczColumnsWizardPref_DefaultColsList.defaultColsListObj.items);
		let cwindex = (col.isCustom || col.isBundled) ? "Col_cw" : "";

		let item = miczColumnsWizardPref_DefaultColsList.defaultColsListObj.get("currindex", col.index + cwindex);
		console.debug(item);
		if (col.enabled && !item.length) {
			console.debug('AddingItem');
			console.debug(col);
			miczColumnsWizardPref_DefaultColsList.defaultColsListObj.add({
				currindex: col.index + "Col_cw",
				show: false,
				sort_by: false,
				name: col.labelString,
				move_up: '<img src="chrome://columnswizard/content/ico/arrow-up-black-64px.png" height="16px" width="16px" class="arrows up-action">',
				move_down: '<img src="chrome://columnswizard/content/ico/arrow-down-black-64px.png" height="16px" width="16px" class="arrows down-action">',
				id: miczColumnsWizardPref_DefaultColsList.defaultColsListObj.items.length + 1,
	
			});

			// name: miczColumnsWizardPref_DefaultColsList.getColLocalizedString(col.index),

			console.debug(miczColumnsWizardPref_DefaultColsList.defaultColsListObj.items);
			console.debug('DoneA');
		} else if (!col.enabled && item.length) {
			console.debug('RemoveItem' );
			console.debug(item);
			console.debug(col);
			console.debug(miczColumnsWizardPref_DefaultColsList.defaultColsListObj.items);
			miczColumnsWizardPref_DefaultColsList.defaultColsListObj.remove("currindex", col.index + cwindex) ;
			console.debug(miczColumnsWizardPref_DefaultColsList.defaultColsListObj.items);
			console.debug('FinishMove');
		}
		
		console.debug('UpdateCheckboxes');
		let checkedItems = miczColumnsWizardPref_DefaultColsList.document.querySelectorAll('[checked]');
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
		console.debug('ToggleFinish');
	},

	
	onRowClick: function (event, offset) {
		// console.debug(event);
		console.debug('Target ' + event.target.outerHTML);
		// console.debug(event.target.outerHTML);
		var selector = 'tr';
		var row = event.target.closest(selector);
		const item = miczColumnsWizardPref_DefaultColsList.defaultColsListObj.items[Number(row.getAttribute("data-id")) - 1];
		// console.debug(item.outerHTML);
		if (event.target.classList.contains('toggle-action-show')) {
			console.debug('Show class');
			console.debug(`click: ${event.target.outerHTML}  : ${event.target.checked}`);
			if (!event.target.checked) {
				item.values({ "show": false });
				event.target.removeAttribute("checked");
			} else {
				item.values({ "show": true }, true);
			}
			event.stopPropagation();
			miczColumnsWizardPref_DefaultColsList.saveDefaultColsList();
			return;
		}

		if (event.target.classList.contains('toggle-action-sort-by')) {
			console.debug('Sort By');
			// console.debug(`click: ${event.target.outerHTML}  : ${event.target.checked}`);
			if (!event.target.checked) {
				item.values({ "sort_by": false });
				event.target.removeAttribute("checked");
				// console.debug('toggle false');
			} else {
				// console.debug('SortBy true ');
				let sbrows = miczColumnsWizardPref_DefaultColsList.defaultColsListObj.get("sort_by", true);
				sbrows.forEach(item => {
					item.values({ "sort_by": false });
				});
				// console.debug(sbrows);
				item.values({ "sort_by": true }, true);
				console.debug('toggle true');
			}
			// console.debug(item.values());
			// console.debug(item);
			// console.debug(lst.outerHTML);
			event.stopPropagation();
			miczColumnsWizardPref_DefaultColsList.saveDefaultColsList();
			return;
		}

		if (event.target.classList.contains('up-action')) {
			console.debug('MoveUp');
			miczColumnsWizardPref_DefaultColsList.move(event, 1);
			miczColumnsWizardPref_DefaultColsList.saveDefaultColsList();

		} else if (event.target.classList.contains('down-action')) {
			miczColumnsWizardPref_DefaultColsList.move(event, -1);
			miczColumnsWizardPref_DefaultColsList.saveDefaultColsList();
		}
	},

	move: function (event, offset) {
		// console.debug('MoveObject  ' + offset);
		var listElement = miczColumnsWizardPref_DefaultColsList.defaultColsList;
		var selector = 'tr';
		var row = event.target.closest(selector);

		// console.debug(row.getAttribute("data-id"));
		miczColumnsWizardPref_DefaultColsList.defaultColsListObj.controller.selectRowByDataId(row.getAttribute("data-id"));

		var selectedID = miczColumnsWizardPref_DefaultColsList.defaultColsListObj.controller.getSelectedRowDataId();

		// console.debug('SelectedId ' + selectedID);
		// console.debug(listElement.rows.length - 1);

		// 1 === up

		if (selectedID === '1' && offset > 0 || Number(selectedID) === miczColumnsWizardPref_DefaultColsList.defaultColsListObj.list.rows.length - 1 && offset < 0) {
			return;
		}


		var selectedElement = miczColumnsWizardPref_DefaultColsList.defaultColsListObj.controller.getSelectedRowElement();
		// console.debug(selectedElement);
		var swapElement;
		var swapItem;
		var selectedItem;
		if (offset === 1) {
			swapElement = selectedElement.previousElementSibling;
			selectedItem = miczColumnsWizardPref_DefaultColsList.defaultColsListObj.item[Number(selectedID)];
			swapItem = miczColumnsWizardPref_DefaultColsList.defaultColsListObj.item[Number(selectedID) - 1];
			// console.debug('offset1');

		} else {
			swapElement = selectedElement.nextElementSibling;
		}

		// console.debug(swapElement);
		selectedElement.setAttribute("data-id", selectedID - 1);
		swapElement.setAttribute("data-id", selectedID + 1);

		selectedElement.remove();

		if (offset === 1) {
			// console.debug(listElement.outerHTML);
			// console.debug(selectedElement);
			swapElement.before(selectedElement);
		} else {
			swapElement.parentNode.insertBefore(selectedElement, swapElement.nextSibling);
		}


		miczColumnsWizardPref_DefaultColsList.defaultColsListObj.reIndex();

		let checkedItems = miczColumnsWizardPref_DefaultColsList.document.querySelectorAll('[checked]');
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


		miczColumnsWizardPref_DefaultColsList.defaultColsListObj.controller.selectRowByDataId(selectedID - 1);
		// console.debug(lst.outerHTML);
	},


	loadDefaultColRows_Pref: function () {
		// let prefsc = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
		// let prefs = prefsc.getBranch("extensions.ColumnsWizard.");
		// let DefaultColIndexStr=prefs.getCharPref("DefaultColsList");
		console.debug('loadDefaultColRows_Pref');
		let DefaultColIndexStr = miczColumnsWizardPrefsUtils.getCharPref_CW("DefaultColsList");
		// console.debug(`CurrentIndexS: ${DefaultColIndexStr}`);
		console.debug(DefaultColIndexStr);

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

		console.debug('LoadedDefaultColumns');
		console.debug(loadedDefaultColIndex);
		console.debug('Base DefaultColumns');
		console.debug(baseColumnStates);

		console.debug('CheckDefault');
		// for (let key in loadedDefaultColIndex) {
		// 	// console.debug(key);
		// 	if (key.includes("Col_cw")) {
		// 		delete loadedDefaultColIndex[key];
		// 		console.debug('DeleteK ' + key);
		// 	}
		// }

		if (Object.keys(baseColumnStates).length !== Object.keys(loadedDefaultColIndex).length) { // if the length are different so check the column to add
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] different lengths\r\n");
			for (let key in baseColumnStates) {
				// console.debug(key);
				if (!loadedDefaultColIndex.hasOwnProperty(key)) {
				// if (!loadedDefaultColIndex.hasOwnProperty(key) && this.loadedCustCols[key] && this.loadedCustCols[key].enabled) {
					loadedDefaultColIndex[key] = baseColumnStates[key];
					console.debug('Adding ');
					console.debug(baseColumnStates[key]);
					// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] key not found "+key+"\r\n");
				}
				
				// } else if (loadedDefaultColIndex.hasOwnProperty(key) && loadedDefaultColIndex[key].isCustom && !this.loadedCustCols.hasOwnProperty(key)) {
				// 	console.debug('RemovedDefaultCustom.Key ' + key);
				// 	delete loadedDefaultColIndex[key];
				// }

			}
		}
		miczColumnsWizardPrefsUtils.setCharPref_CW("DefaultColsList", JSON.stringify(loadedDefaultColIndex));
		console.debug('Saved LoadedDefaultColumns');
		console.debug(loadedDefaultColIndex);
		
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] "+JSON.stringify(loadedDefaultColIndex)+"\r\n");
		return loadedDefaultColIndex;
	},

	fixOrdinalValues: function (columnStates) {
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid fixOrdinalValues start] columnStates: "+JSON.stringify(columnStates)+"\r\n");
		let last_ordinal = -1;
		for (let key in columnStates) {
			if ((columnStates[key].ordinal === 0) || (columnStates[key].ordinal === null) || (columnStates[key].ordinal === '')) {
				if (last_ordinal === -1) {
					columnStates[key].ordinal = 1;
				} else {
					columnStates[key].ordinal = last_ordinal + 2;
				}
			}
			last_ordinal = columnStates[key].ordinal;
		}
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid fixOrdinalValues end] columnStates: "+JSON.stringify(columnStates)+"\r\n");
		return columnStates;
	},

	getOriginalColIndex: function () {
		var wMediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
		var mainWindow = wMediator.getMostRecentWindow("mail:3pane");
		// return mainWindow.gFolderDisplay._getDefaultColumnsForCurrentFolder(); //this version doesn't get custom columns
		return mainWindow.gFolderDisplay.getColumnStates();
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

	getSortOrder: function (sort_order) {
		let nsMsgViewSortOrder = Ci.nsMsgViewSortOrder;

		switch (sort_order) {
			case "ASC":
				return nsMsgViewSortOrder.ascending;
			case "DESC":
				return nsMsgViewSortOrder.descending;
		}
		return nsMsgViewSortOrder.ascending;
	},

	getSortType: function (col) {
		let nsMsgViewSortType = Ci.nsMsgViewSortType;

		switch (col) {
			case "threadCol":
				return nsMsgViewSortType.byThread;
			case "senderCol":
				return nsMsgViewSortType.byAuthor;
			case "recipientCol":
				return nsMsgViewSortType.byRecipient;
			case "subjectCol":
				return nsMsgViewSortType.bySubject;
			case "dateCol":
				return nsMsgViewSortType.byDate;
			case "priorityCol":
				return nsMsgViewSortType.byPriority;
			case "tagsCol":
				return nsMsgViewSortType.byTags;
			case "accountCol":
				return nsMsgViewSortType.byAccount;
			case "statusCol":
				return nsMsgViewSortType.byStatus;
			case "sizeCol":
				return nsMsgViewSortType.bySize;
			case "junkStatusCol":
				return nsMsgViewSortType.byJunkStatus;
			/* case "unreadCol":
			return nsMsgViewSortType.;
			break;*/
			/* case "totalCol":
			return nsMsgViewSortType.;
			break;*/
			case "unreadButtonColHeader":
				return nsMsgViewSortType.byUnread;
			case "receivedCol":
				return nsMsgViewSortType.byReceived;
			case "flaggedCol":
				return nsMsgViewSortType.byFlagged;
			case "locationCol":
				return nsMsgViewSortType.byLocation;
			case "idCol":
				return nsMsgViewSortType.byId;
			case "attachmentCol":
				return nsMsgViewSortType.byAttachments;
			case "correspondentCol":
				return nsMsgViewSortType.byCorrespondent;
			default:
				// return nsMsgViewSortType.byCustom;
				// No sorting bycustom at the moment
				return -1;
		}
	},

	sortDefaultColsList: function () {
		let DefColRows = miczColumnsWizardPref_DefaultColsList.loadDefaultColRows_Pref();
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

};
