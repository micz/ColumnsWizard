/* List.js is required to make this table work. */

"use strict";

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
var { miczColumnsWizardPref_CustomColsGrid } = ChromeUtils.import("chrome://columnswizard/content/mzcw-customcolsgrid.jsm");
var { miczColumnsWizardPref_DefaultColsGrid } = ChromeUtils.import("chrome://columnswizard/content/mzcw-defaultcolsgrid.jsm");
var { miczColumnsWizardPrefsUtils } = ChromeUtils.import("chrome://columnswizard/content/mzcw-prefsutils.jsm");

// var miczColumnsWizard = window.opener.miczColumnsWizard;
var miczColumnsWizard = window.miczColumnsWizard;
var tableList;

var miczColumnsWizardPref2 = {

	htmlToElements: function (html) {
		var domParser = new DOMParser();
		domParser.forceEnableXULXBL();
		var docFragment = domParser.parseFromString(html, 'text/html');
		console.debug(docFragment.body.firstChild.outerHTML);
		return docFragment.body.firstChild;
	},

	settingsLoad: function () {

		// var e = document.getElementById("test");
		// var e2 = document.getElementById("test2");
		
		// e.appendChild(miczColumnsWizardPref2.htmlToElements('<input type="checkbox">'));
		// e.appendChild(miczColumnsWizardPref2.htmlToElements('<img src="chrome://columnswizard/content/i/arrow-up-black-64px.png" height="16px" width="16px" class="arrows down-action">'));
		// e2.appendChild(miczColumnsWizardPref2.htmlToElements('<img src="chrome://icons/resource/arrow-down-black-64px.png" height="16px" width="16px" class="arrows down-action">'));
		// e.appendChild(miczColumnsWizardPref2.htmlToElements('<img src="arrow-down-black-64px.png" height="16px" width="16px" class="arrows down-action">'));

		// var html = '<img src="arrow-down-black-64px.png" height="16px" width="16px" class="arrows down-action">';
		// e2.innerHTML = '<img src="arrow-down-black-64px.png" height="16px" width="16px" class="arrows down-action">';
		// console.debug(e.outerHTML);

		// var parser = new DOMParser();
		// parser.forceEnableXULXBL();
		// var docFragment2 = parser.parseFromString(html, 'text/html');
		// console.debug(docFragment2.body.firstChild.outerHTML);
		// // e2.appendChild(docFragment2.body.firstChild);
		// var i = docFragment2.body.firstChild.outerHTML;
		// e.innerHTML = i;

		// return;

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

		// <img src="./arrow-down-black-64px.png" height="16px" width="16px" class="arrows down-action">\

		
		console.debug('Start');
		// var tableList = new List('tableID',  {plugins: ListController()});
 		tableList = new List('tableID', options);

		var lst = document.getElementById('defaultColTable');
		lst.addEventListener('click', onRowClick);
		// lst.addEventListener('keydown', onKey);

		tableList.controller = new ListController(tableList);

		var dindex = 1;

		miczColumnsWizardPref2.loadDefaultColRows_Pref();
		var defaultColsObj = miczColumnsWizardPref2.sortDefaultColsList();
		var defaultCols = defaultColsObj.defaultCols;
		var sorted_cols = defaultColsObj.sorted_cols;

		var sortcolindex = miczColumnsWizardPrefsUtils.getIntPref("mailnews.default_sort_type");
		console.debug('sort indextype ' + sortcolindex);
		
		console.debug(defaultCols);
		var sb;
		for (let index in sorted_cols) {
		// for (const colId in defaultCols) {

			var element = defaultCols[sorted_cols[index][0]];
			

			// if (defaultCols.hasOwnProperty(colId)) {
			if (1) {
				// const element = defaultCols[colId];
				console.debug('Check ' + sortcolindex + '  ' + miczColumnsWizardPref2.getSortType(element.currindex));
				if (sortcolindex === miczColumnsWizardPref2.getSortType(element.currindex)) {
					// col_sortby.setAttribute("selected", true);
					sb = true;
				} else {
					sb = false;
				}
				// console.debug(colId);
				console.debug( element );
				// console.debug( element.visible );
				// console.1debug( element.sort_by);
				// let sb = element.sort_by ? "true" : "false";
				// console.debug(sb);
				tableList.add({
					currindex: element.currindex,
					show: element.visible,
					sort_by: sb,
					name: miczColumnsWizardPref2.getColLocalizedString(element.currindex),
					move_up: '<img src="chrome://columnswizard/content/ico/arrow-up-black-64px.png" height="16px" width="16px" class="arrows up-action">',
					move_down: '<img src="chrome://columnswizard/content/ico/arrow-down-black-64px.png" height="16px" width="16px" class="arrows down-action">',
					id: dindex++,
				});


			}
		}

		// console.debug(lst.outerHTML);

		// let uncheckedItems = document.querySelectorAll('[checked="false"]');
		// for (const element of uncheckedItems) {
		// 	element.removeAttribute("checked");
		// }


		let checkedItems = document.querySelectorAll('[checked]');
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
		// console.debug(lst.outerHTML);

		// console.debug(lst.outerHTML);


		// function onRowClick(obj, offset) {
		function onRowClick(event, offset) {
			// console.debug(event);
			console.debug('Target ' + event.target.outerHTML);
			// console.debug(event.target.outerHTML);
			var selector = 'tr';
			var row = event.target.closest(selector);
			const item = tableList.items[Number(row.getAttribute("data-id"))-1];
			// console.debug(item.outerHTML);
			if (event.target.classList.contains('toggle-action-show')) {
				console.debug('Show class');
				console.debug(`click: ${event.target.outerHTML}  : ${event.target.checked}`);
				if (!event.target.checked) {
					item.values({"show": false});
					event.target.removeAttribute("checked");
					console.debug('toggle false');
				} else {
					
					item.values({"show": true}, true);
					console.debug('toggle true');
				}
				// console.debug(item.values());
				event.stopPropagation();
				miczColumnsWizardPref2.getDefaultColsFromList();
				return;
			}
			
			if (event.target.classList.contains('toggle-action-sort-by')) {
				console.debug('SortClass');
				console.debug(`click: ${event.target.outerHTML}  : ${event.target.checked}`);
				if (!event.target.checked) {
					item.values({"sort_by": false});
					event.target.removeAttribute("checked");
					console.debug('toggle false');
				} else {
					console.debug('SortBy true ');
					let sbrows = tableList.get("sort_by", true);
					sbrows.forEach(item => {
						item.values({"sort_by": false});
					});
					console.debug(sbrows);
					item.values({"sort_by": true}, true);
					console.debug('toggle true');
				}
				console.debug(item.values());
				console.debug(item);
				// console.debug(lst.outerHTML);
				event.stopPropagation();
				miczColumnsWizardPref2.getDefaultColsFromList();
				return;
			}

			if (event.target.classList.contains('up-action')) {
				console.debug('MoveUp');
				move(event, 1);
				miczColumnsWizardPref2.getDefaultColsFromList();
				
			} else if (event.target.classList.contains('down-action')) {
				move(event, -1);
				miczColumnsWizardPref2.getDefaultColsFromList();
			}
		}

		function move(event, offset) {
			console.debug('MoveObject  ' + offset);
			// console.debug(obj);
			// console.debug(event.target.outerHTML);
			// console.debug(event.currentTarget.outerHTML);
			var listElement = lst;
			console.debug('ListLinks');
			// console.debug(lst.rows );
			// console.debug(lst.rows.length );
			// console.debug(obj.parent);
			// console.debug(obj.parent.outerHTML);
			// let row = event.currentTarget.parentElement.getAttribute("data-id");
			var selector = 'tr';
			var row = event.target.closest(selector);
			
			console.debug(row.getAttribute("data-id"));
			tableList.controller.selectRowByDataId(row.getAttribute("data-id"));

			var selectedID = tableList.controller.getSelectedRowDataId();

			console.debug('SelectedId ' + selectedID);
			console.debug(listElement.rows.length - 1);
			// 1 === up
			if (selectedID === '1' && offset > 0) {
				console.debug('top');
			}

			if (selectedID === '1' && offset > 0 || Number(selectedID) === listElement.rows.length - 1 && offset < 0) {
				return;
			}


			var selectedElement = tableList.controller.getSelectedRowElement();
			console.debug(selectedElement);
			var swapElement;
			var swapItem;
			var selectedItem;
			if (offset === 1) {
				swapElement = selectedElement.previousElementSibling;
				selectedItem = tableList.item[Number(selectedID)];
				swapItem = tableList.item[Number(selectedID)-1];
				console.debug('offset1');

			} else {
				swapElement = selectedElement.nextElementSibling;
			}

			console.debug(swapElement);
			selectedElement.setAttribute("data-id", selectedID - 1);
			swapElement.setAttribute("data-id", selectedID + 1);

			selectedElement.remove();
			// tableList.reIndex();
			console.debug('still, the removed ');
			if (offset === 1) {
				console.debug(listElement.outerHTML);
				console.debug(selectedElement);
				// listElement.insertBefore(selectedElement, swapElement);
				// listElement.insertBefore(selectedElement, null);
				swapElement.before(selectedElement);
				// tableList.item[0] = tableList.item[1];
				// tableList.item[1] = swapItem;
			} else {
				swapElement.parentNode.insertBefore(selectedElement, swapElement.nextSibling);
			}

			
			tableList.reIndex();

			let checkedItems = document.querySelectorAll('[checked]');
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
	
			
			tableList.controller.selectRowByDataId(selectedID - 1);
			console.debug(lst.outerHTML);
		}

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
			loadedDefaultColIndex = miczColumnsWizardPref_DefaultColsGrid.getOriginalColIndex();
			// console.debug(`D IndexS: ${DefaultColIndexStr}`);
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] default loaded and saved pref\r\n");
		} else {
			loadedDefaultColIndex = JSON.parse(DefaultColIndexStr);
			// console.debug(`L IndexS: ${loadedDefaultColIndex}`); 
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] pref loaded\r\n");
		}
		// fix wrong ordina values: columns must have odd ordinal values, because even values are for splitters (used for columns resizing)
		loadedDefaultColIndex = miczColumnsWizardPref_DefaultColsGrid.fixOrdinalValues(loadedDefaultColIndex);
		// check if there are new columns to add
		let baseColumnStates = miczColumnsWizardPref_DefaultColsGrid.getOriginalColIndex();
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


	createDefaultColsGridRows: function (doc, container) {
		let DefColRows = this.loadDefaultColRows_Pref();
		// Sort the columns, by the ordinal value...
		let sorted_cols = [];
		for (let cwcol in DefColRows) {
			let col_ordinal = DefColRows[cwcol].ordinal === 0 ? 99 : DefColRows[cwcol].ordinal;
			sorted_cols.push([cwcol, col_ordinal]);
		}
		sorted_cols.sort(function (a, b) { return a[1] - b[1]; });

		// dump(">>>>>>>>>>>>> miczColumnsWizard: [createDefaultColsGridRows] sorted_cols "+JSON.stringify(sorted_cols)+"\r\n");
		for (let index in sorted_cols) {
			DefColRows[sorted_cols[index][0]].currindex = sorted_cols[index][0];
			this.createOneDefaultColRow(doc, container, DefColRows[sorted_cols[index][0]]);
		}
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
		if (miczColumnsWizardPref_DefaultColsGrid.getSortType(currcol.currindex) !== -1) { // SORT BY only if a standard col. No way to save a customcol for sorting
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
			if (sortcolindex === miczColumnsWizardPref_DefaultColsGrid.getSortType(currcol.currindex)) col_sortby.setAttribute("selected", true);
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
			['\u2191', function (aEvent) { miczColumnsWizardPref_DefaultColsGrid.upDownCol(row, true); }, ''],
			['\u2193', function (aEvent) { miczColumnsWizardPref_DefaultColsGrid.upDownCol(row, false); }, '']].map(function (attributes) {
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

	getSortType: function (col) {
		let nsMsgViewSortType = Ci.nsMsgViewSortType;

		switch (col) {
			case "threadCol":
				console.debug('ThreadSort ' + nsMsgViewSortType.byThread);
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

	getDefaultColsFromList: function () {
		console.debug('SaveDefault');
		console.debug(tableList.items);
		var newDefaultCols = {};
		let ordinal = 1;

		for (let index = 0; index < tableList.items.length; index++) {
			const element = tableList.items[index];
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
				let so =  miczColumnsWizardPref2.getSortType(vals.currindex);
				console.debug('cO ' +  miczColumnsWizardPref2.getSortType(vals.currindex));
				console.debug(so);

				let sortcolindex = miczColumnsWizardPrefsUtils.setIntPref("mailnews.default_sort_type", so);
				ci = miczColumnsWizardPrefsUtils.getIntPref("mailnews.default_sort_type");
				console.debug('NewSort ' + ci);
				
				// let sortcolindex = miczColumnsWizardPrefsUtils.setIntPref("mailnews.default_sort_type", miczColumnsWizardPref_DefaultColsGrid.getSortType(vals.currindex));
				// console.debug(vals.sort_by,);
				console.debug(sortcolindex);
		}
			// newDefaultCols[elemWeent.currindex].
			
			// console.debug(element.values());
			ordinal += 2;
			
		}

		let cbelement = document.getElementById("ColumnsWizard.DefaultColsList.active_checkbox");

		let dca = cbelement.checked;
		miczColumnsWizardPrefsUtils.setBoolPref_CW("DefaultColsList.active", dca);

		console.debug(newDefaultCols);
		console.debug('F SaveDefault');
		miczColumnsWizardPrefsUtils.setCharPref_CW("DefaultColsList", JSON.stringify(newDefaultCols));
		return newDefaultCols;
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
