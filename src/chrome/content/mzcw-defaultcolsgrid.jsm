"use strict";

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
var { miczColumnsWizardPrefsUtils } = ChromeUtils.import("chrome://columnswizard/content/mzcw-prefsutils.jsm");

var EXPORTED_SYMBOLS = ["miczColumnsWizardPref_DefaultColsGrid"];

const colClass = 'cw-col-class';

var miczColumnsWizardPref_DefaultColsGrid = {

	loadedCustCols: {},

	loadDefaultColRows_Pref: function () {
		// let prefsc = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
		// let prefs = prefsc.getBranch("extensions.ColumnsWizard.");
		// let DefaultColIndexStr=prefs.getCharPref("DefaultColsList");
		let DefaultColIndexStr = miczColumnsWizardPrefsUtils.getCharPref_CW("DefaultColsList");
		let loadedDefaultColIndex = [];
		if (DefaultColIndexStr === '') {
			// Set default cols if none set at the moment
			loadedDefaultColIndex = miczColumnsWizardPref_DefaultColsGrid.getOriginalColIndex();
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] default loaded and saved pref\r\n");
		} else {
			loadedDefaultColIndex = JSON.parse(DefaultColIndexStr);
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

	createDefaultColsGridHeader: function (doc, container) {
		const XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
		let _bundleCW = Services.strings.createBundle("chrome://columnswizard/locale/overlay.properties");

		if (!container) return;
		while (container.firstChild) container.firstChild.remove();
		let row = doc.createElementNS(XUL, "row"); // header does not have class colClass
		["show", "sort_by", "col_title", "col_flex", "up", "down"].forEach(function (label) {
			let item = doc.createElementNS(XUL, "label");
			item.setAttribute('value', label !== " " ? _bundleCW.GetStringFromName("ColumnsWizardNFCols." + label) : "");
			// item.setAttribute('value', label);
			if (label === "col_flex") item.setAttribute('hidden', true);
			if ((label === "up") || (label === "down")) {
				item.setAttribute('class', 'mzcw-grid_hdr_cnt');
			}
			row.insertBefore(item, null);
		});
		row.id = container.name + "-header";
		container.insertBefore(row, null);
		/* }catch(err) {
		  dump(">>>>>>>>>>>>> miczColumnsWizard: [settings createDefaultColsGridHeader] "+err+"\r\n");
		}*/
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

	saveDefaultColsGridRows: function (doc, container, save_pref) {
		let value = JSON.stringify(this.getDefaultCols(container));
		if (save_pref) {
			let preference = doc.getElementById("ColumnsWizard.DefaultColsList");
			preference.value = value;
		}
		return value;
	},

	getDefaultCols: function (container) {
		let cw_cols = {};
		let ordinal = 1;
		// try {
		if (!container) {
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [getDefaultCols] no container\r\n");
			return cw_cols;
		}
		for (let row of container.childNodes) {
			if (row.classList.contains(colClass)) {
				let cw_col = this.getOneDefaultCol(row, ordinal);
				if (Object.keys(cw_col).length > 0) {
					cw_cols[cw_col.currindex] = cw_col;
					// dump(">>>>>>>>>>>>> miczColumnsWizard: [getDefaultCols] added cw_col {"+JSON.stringify(cw_col)+"}\r\n");
				}
				ordinal = ordinal + 2;
			}
		}
		// } catch (err) { throw err; } // throw the error out so syncToPerf won't get an empty rules
		return cw_cols;
	},

	getOneDefaultCol: function (row, ordinal) {
		let cwcol = {};
		if (!ordinal) ordinal = "1";
		// let ii=1;
		for (let item of row.childNodes) {
			let key = item.getAttribute('cwcol');
			if (key) {
				let value = item.value || item.checked;
				if (item.getAttribute("type") === 'number') value = item.valueNumber;
				if (item.getAttribute("type") === 'radio') {
					if (item.selected) {
						// let prefsc = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
						// let prefs = prefsc.getBranch("mailnews.");
						// let sortcolindex=prefs.setIntPref("default_sort_type",miczColumnsWizardPref_DefaultColsGrid.getSortType(cwcol['currindex']));
						let sortcolindex = miczColumnsWizardPrefsUtils.setIntPref("mailnews.default_sort_type", miczColumnsWizardPref_DefaultColsGrid.getSortType(cwcol.currindex));
						// dump(">>>>>>>>>>>>> miczColumnsWizard: [getOneDefaultCol col_id] "+cwcol['currindex']+"\r\n");
					}
				} else {
					cwcol[key] = value;
				}
				// dump(">>>>>>>>>>>>> miczColumnsWizard: "+ii+" [getOneDefaultCol key|value] "+key+"|"+cwcol[key]+"\r\n");
				// dump(">>>>>>>>>>>>> miczColumnsWizard: [getOneDefaultCol] getting cwcol {"+JSON.stringify(cwcol)+"}\r\n");
				// ii++;
			}
		}
		cwcol.ordinal = ordinal;
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [getOneDefaultCol] get cwcol {"+JSON.stringify(cwcol)+"}\r\n");
		return cwcol;
	},

	upDownCol: function (row, isUp) {
		let doc = row.ownerDocument;
		let container = doc.getElementById('ColumnsWizard.DefaultColsGrid');
		// try {
		let ref = isUp ? row.previousSibling : row;
		let remove = isUp ? row : row.nextSibling;
		if (ref && remove && ref.classList.contains(colClass) && remove.classList.contains(colClass)) {
			let cwcol = this.getOneDefaultCol(remove);
			// Check
			remove.remove();
			// remove.parentNode.insertBefore(remove, ref); // lost all unsaved values
			let newBox = this.createOneDefaultColRow(doc, container, cwcol, ref);
			// this.checkFocus( isUp ? newBox : row );
			// this.syncToPerf(true);
			this.saveDefaultColsGridRows(doc, container, true);
		}
		// } catch(err) {
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid upDownCol error] "+err+"\r\n");
		// }
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

};
