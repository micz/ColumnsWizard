"use strict";

// Services appears to be defined globally in TB64+ ?
if (!Services) {
	var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
}

var { miczColumnsWizardPrefsUtils } = ChromeUtils.import("chrome://columnswizard/content/mzcw-prefsutils.jsm");
var { miczColumnsWizard_CustomColsModUtils } = ChromeUtils.import("chrome://columnswizard/content/mzcw-customcolsmodutils.jsm", this);
var { miczColumnsWizardPref_DefaultColsList } = ChromeUtils.import("chrome://columnswizard/content/mzcw-defaultcolslist.jsm");
var { miczColumnsWizardPref_CustomColsList } = ChromeUtils.import("chrome://columnswizard/content/mzcw-customcolslist.jsm");

var { miczColumnsWizard_MsgUtils } = ChromeUtils.import("chrome://columnswizard/content/mzcw-msgutils.jsm");
var { miczColumnsWizardUtils } = ChromeUtils.import("chrome://columnswizard/content/mzcw-utils.jsm");
var { miczLogger } = ChromeUtils.import("chrome://columnswizard/content/modules/miczLogger.jsm");

var miczColumnsWizard = {

	// Menu placeholders
	originalRestoreCols: null,

	// Conversation Tab Columns
	showLocation: true,
	showAccount: false,
	showAttachment: false,
	showRecipient: false,

	// Custom Columns
	CustColPref: {},
	tabMonitor: null,

	init: function () {

		miczColumnsWizard_CustomColsModUtils.miczColumnsWizard = miczColumnsWizard;
		miczLogger.setLogger(true, miczColumnsWizardPrefsUtils.isDebug);

		// cleidigh disable and fix
		if (miczColumnsWizardPrefsUtils.firstRun) {		// adding toolbar button at first run
			miczColumnsWizardPrefsUtils.firstRunDone();
			miczColumnsWizard.addToolbarButton();
		}

		let ObserverService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);

		miczColumnsWizard.addNewCustColObserver(ObserverService);
		miczColumnsWizard.deleteCustColObserver(ObserverService);
		miczColumnsWizard.updateCustColObserver(ObserverService);
		miczColumnsWizard.updateHeaderEditingMenuObserver(ObserverService);

		// Adding custom columns
		miczColumnsWizard.CustColPref = miczColumnsWizardPref_CustomColsList.loadCustCols();

		for (let index in miczColumnsWizard.CustColPref) {
			miczColumnsWizard.addDbObserver(miczColumnsWizard.CustColPref[index]);
		}

		for (let index in miczColumnsWizard.CustColPref) {
			miczColumnsWizard.custColsActivation(miczColumnsWizard.CustColPref[index], ObserverService);
		}

		miczColumnsWizard.watchFolders();
		miczColumnsWizard.initHeadersEditingMenu();

		let current_tab = document.getElementById("tabmail").currentTabInfo;
		miczColumnsWizard.addCWResetMenu(current_tab);

		// cleidigh not used?
		// this.initialized = true;
		// Conversation Tab add columns - delayed
		setTimeout(function () { miczColumnsWizard.initDelayed(); }, 750);
		miczLogger.log("ColumnsWizard loaded...", 0);
	},

	initDelayed: function () {
		try {
			// Conversation Tab add columns
			let tabmail = window.document.getElementById("tabmail");
			// console.debug(tabmail);
			miczColumnsWizard.tabMonitor = {
				onTabTitleChanged: function (tab) { },
				onTabSwitched: function (tab) {
					// console.debug(tab);
					miczColumnsWizard.addCWResetMenu(tab);
				},
				// onTabRestored:function(tab){},
				onTabOpened: function (tab) {
					// console.debug('open to');
					// console.debug(tab);
					miczColumnsWizard.showColumns(tab);
				},
			};
			tabmail.registerTabMonitor(miczColumnsWizard.tabMonitor);
		} catch (e) {
			alert("No tabContainer available! " + e);
		}
	},

	addNewCustColObserver: function (ObserverService) {
		let CustColObserver = {
			observe: function (aSubject, aTopic, aData) {
				// dump(">>>>>>>>>>>>> miczColumnsWizard->CustColObserver: [aSubject] "+aData+"\r\n");
				miczColumnsWizard.addDbObserver(JSON.parse(aData));
			},
		};
		ObserverService.addObserver(CustColObserver, "CW-newCustomColumn", false);
	},

	deleteCustColObserver: function (ObserverService) {
		let CustColObserver = {
			observe: function (aSubject, aTopic, aData) {
				// console.debug('DeleteObserver ' );
				// console.debug(aData);

				let ObserverService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
				miczColumnsWizard_CustCols.removeCustomColumn(aData, ObserverService);
				miczColumnsWizard_CustCols.deleteCustCol(aData);
			},
		};
		ObserverService.addObserver(CustColObserver, "CW-deleteCustomColumn", false);
	},

	updateCustColObserver: function (ObserverService) {
		let CustColObserver = {
			observe: function (aSubject, aTopic, aData) {
				// dump(">>>>>>>>>>>>> miczColumnsWizard->CustColObserver: [aSubject] "+aData+"\r\n");
				let ObserverService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
				// update cust col info in the message list
				// console.debug('CustomColumnUpdate');
				// console.debug(aData);
				miczColumnsWizard_CustCols.updateCustomColumn(JSON.parse(aData));
			},
		};
		ObserverService.addObserver(CustColObserver, "CW-updateCustomColumn", false);
	},

	addDbObserver: function (currcol) {
		// console.debug('Observer');
		// console.debug(currcol);
		
		// Create all the needed DbObservers
		// dump(">>>>>>>>>>>>> miczColumnsWizard->CreateDbObserver: [index] "+currcol.index+"\r\n");
		// It's needed to to this, to avoid writing each miczColumnsWizard_CustCols.CreateDbObserver_COLNAME by hand, because we need to pass the index var inside the observe function definition.
		let obfunction = function (aMsgFolder, aTopic, aData) { miczColumnsWizard_CustCols.addCustomColumnHandler(currcol.index); };
		miczColumnsWizard_CustCols.CreateDbObserver[currcol.index] = { observe: obfunction };
		// Create all the needed DbObserver - END

		// Implement all the needed ColumnHandlers
		let sortfunc = function (hdr) { return hdr.getStringProperty(currcol.dbHeader); };
		let sortfunc_number = function (hdr) {	// max unsigned long 4294967296-1
			let output = hdr.getStringProperty(currcol.dbHeader) * 1000;
			output += 1000000000;
			// miczLogger.log(">>>>>>>>>>>>> miczColumnsWizard->CreateDbObserver: [output original] "+hdr.getStringProperty(currcol.dbHeader)+"\r\n");
			// miczLogger.log(">>>>>>>>>>>>> miczColumnsWizard->CreateDbObserver: [output] "+JSON.stringify(output)+"\r\n");
			return output;
		};
		let is_stringfunc = function (hdr) { return !currcol.sortnumber; };
		let celltextfunc = function (row, col) {
			let hdr = gDBView.getMsgHdrAt(row); let output = hdr.getStringProperty(currcol.dbHeader);
			// miczLogger.log(">>>>>>>>>>>>> miczColumnsWizard->CreateDbObserver: [celltextfunc] "+JSON.stringify(output)+"\r\n");
			return output;
		};
		// dump(">>>>>>>>>>>>> miczColumnsWizard->CreateDbObserver: [currcol] "+JSON.stringify(currcol)+"\r\n");
		miczColumnsWizard_CustCols["columnHandler_" + currcol.index] = {
			getCellText: celltextfunc,
			getSortStringForRow: sortfunc,
			isString: is_stringfunc,
			getCellProperties: function (row, col, props) { },
			getRowProperties: function (row, props) { },
			getImageSrc: function (row, col) { return null; },
			getSortLongForRow: sortfunc_number,
		};
		// Implement all the needed ColumnHandlers - END
	},

	removeCustomColumn: function (coltype, ObserverService) {
		let element = document.getElementById(coltype + "Col_cw");
		if (element) element.remove();

		// dump(">>>>>>>>>>>>> miczColumnsWizard->removeCustomColumn: [coltype] "+coltype+"\r\n");
		// DbObserver Managing
		try {
			ObserverService.removeObserver(miczColumnsWizard_CustCols.CreateDbObserver[coltype], "MsgCreateDBView");
		} catch (ex) {
			// No observer found
		}
	},

	custColsActivation: function (element, ObserverService) {
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [element|index] "+element.Pref+"|"+index+"\r\n");
		if (element.enabled === true) {
			miczColumnsWizard_CustCols.addCustomColumn(element, ObserverService);
			if (element.isCustom !== false) {
				miczColumnsWizard.activateCustomDBHeader(element.dbHeader);
			}
		}
	},

	activateCustomDBHeader: function (newHeader) {
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [customDBHeaders] "+newHeader+"\r\n");
		// let prefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
		// let currentHeaders = prefService.getCharPref("mailnews.customDBHeaders");
		let currentHeaders = miczColumnsWizardPrefsUtils.getCharPref("mailnews.customDBHeaders");
		let re = new RegExp("(^| )" + newHeader + "( |$)", "i");
		if (currentHeaders.search(re) < 0) {
			currentHeaders = currentHeaders + " " + newHeader;
			miczColumnsWizardPrefsUtils.setCharPref("mailnews.customDBHeaders", currentHeaders.trim());
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [customDBHeaders->Updating] "+newHeader+"\r\n");
		}
	},

	deactivateCustomDBHeader: function (newHeader) {
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [deactivate customDBHeaders] "+newHeader+"\r\n");
		// let prefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
		// let currentHeaders = prefService.getCharPref("mailnews.customDBHeaders");
		let currentHeaders = miczColumnsWizardPrefsUtils.getCharPref("mailnews.customDBHeaders");
		let re = new RegExp("(^| )" + newHeader + "( |$)", "i");
		currentHeaders = currentHeaders.replace(re, " ");
		miczColumnsWizardPrefsUtils.setCharPref("mailnews.customDBHeaders", currentHeaders);
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [deactivate customDBHeaders->Updating] "+newHeader+"\r\n");
	},

	showColumns: function (tab) {
		// let prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
		// prefs = prefs.getBranch("extensions.ColumnsWizard.");
		this.showLocation = miczColumnsWizardPrefsUtils.getBoolPref_CW("ShowLocation");
		this.showAccount = miczColumnsWizardPrefsUtils.getBoolPref_CW("ShowAccount");
		this.showAttachment = miczColumnsWizardPrefsUtils.getBoolPref_CW("ShowAttachment");
		this.showRecipient = miczColumnsWizardPrefsUtils.getBoolPref_CW("ShowRecipient");

		if (tab.mode.name === 'glodaList') {
			if (this.showLocation) { // show location column
				let loccv = document.getElementById("locationCol");
				if (loccv) loccv.setAttribute("hidden", "false");
			}
			if (this.showAccount) { // show account column
				let accountcv = document.getElementById("accountCol");
				if (accountcv) accountcv.setAttribute("hidden", "false");
			}
			if (this.showAttachment) { // show attachment column
				let attachcv = document.getElementById("attachmentCol");
				if (attachcv) attachcv.setAttribute("hidden", "false");
			}
			if (this.showRecipient) { // show recipient column
				let recipientcv = document.getElementById("recipientCol");
				if (recipientcv) recipientcv.setAttribute("hidden", "false");
			}
		}
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [tab folder mode] "+tab.mode.name+" \r\n");
		miczColumnsWizard.addCWResetMenu(tab);
	},

	addCWResetMenu: function (tab) {
		// if (tab.mode.name === 'folder' || true) {
		// console.debug('addCWResetMenu');
		if (true) {


			// Must query visible for TB64+
			// let e2 = e.querySelector('treecolpicker');

			// var cw_colmenubind = document.getAnonymousElementByAttribute(document.getElementById('threadCols'),'class','treecol-image');
			var cw_colmenubind = document.getElementById('threadCol');
			let e2 = document.querySelector('treecolpicker');
			// console.debug(cw_colmenubind.outerHTML);
			cw_colmenubind = e2;
			// console.debug(cw_colmenubind.outerHTML);
			// console.debug(cw_colmenubind.buildPopup.toString());

			dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWResetMenu] tab.cw_colmenubind.command "+cw_colmenubind.oncommand+"\r\n");
			// if (!cw_colmenubind.cw_original_buildPopup) {
				if(0) {
				cw_colmenubind.cw_original_buildPopup = cw_colmenubind.buildPopup;
				// dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWResetMenu] tab.cw_colmenubind.buildPopup "+cw_colmenubind.buildPopup+"\r\n");
				// dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWResetMenu] FIRST TIME\r\n");
				
					cw_colmenubind.buildPopup.prototype = function (aPopup) { // buildPopup wrapper function START
					// dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWResetMenu] "+this.parentNode.parentNode.id+"\r\n");
					// Remove the columns' line... the popupmenu is built again every time from the original function...

					if (aPopup.childNodes.length >= 5) {
						while (aPopup.childNodes.length > 5) {
							aPopup.firstChild.remove();
						}
						// ... now remove the resetMenuCW and saveDefaultMenuCW items...
						aPopup.removeChild(aPopup.childNodes[2]);
						aPopup.removeChild(aPopup.childNodes[2]);
					}
					// check if we're using the colcw default for new folders
					let cw_active = miczColumnsWizardPrefsUtils.defaultColsListActive;

					let _bundleCW = Services.strings.createBundle("chrome://columnswizard/locale/overlay.properties");

					aPopup.childNodes[1].setAttribute('hidden', cw_active ? 'true' : 'false');

					cw_colmenubind.cw_original_buildPopup(aPopup);
					// Add saveDefaultMenuCW element
					let saveDefaultMenuCW = document.createXULElement("menuitem");
					saveDefaultMenuCW.setAttribute('label', _bundleCW.GetStringFromName("ColumnsWizardNFCols.saveDefault"));
					saveDefaultMenuCW.setAttribute('hidden', cw_active ? 'false' : 'true');
					// we do this to escape the command xbl event handler
					saveDefaultMenuCW.setAttribute("colindex", "-1");
					saveDefaultMenuCW.setAttribute("class", "menuitem-iconic");
					saveDefaultMenuCW.setAttribute("image", "chrome://columnswizard/skin/ico/saveDefaultMenuCW.png");
					saveDefaultMenuCW.setAttribute("onclick", "miczColumnsWizard.addCWSaveDefaultMenu_OnClick(event)");
					aPopup.insertBefore(saveDefaultMenuCW, aPopup.lastChild);

					// Add resetMenuCw element
					let resetMenuCW = document.createXULElement("menuitem");
					resetMenuCW.setAttribute('label', _bundleCW.GetStringFromName("ColumnsWizardNFCols.resetMenu"));
					resetMenuCW.setAttribute('hidden', cw_active ? 'false' : 'true');
					// we do this to escape the command xbl event handler
					resetMenuCW.setAttribute("colindex", "-1");
					resetMenuCW.setAttribute("class", "menuitem-iconic");
					resetMenuCW.setAttribute("image", "chrome://columnswizard/skin/ico/resetMenuCW.png");
					resetMenuCW.onclick = miczColumnsWizard.addCWResetMenu_OnClick;
					aPopup.insertBefore(resetMenuCW, aPopup.lastChild);

				};	// buildPopup wrapper function END
			}
			let tc = document.querySelector("treecolpicker[is=thread-pane-treecolpicker]");

			let tc_menu = tc.querySelector("menupopup");

			miczColumnsWizard.bpop(tc_menu, tc);
    

		}
	},

	bpop: function (aPopup, tc) { // buildPopup wrapper function START
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWResetMenu] "+this.parentNode.parentNode.id+"\r\n");
		// Remove the columns' line... the popupmenu is built again every time from the original function...
		
		// check if we're using the colcw default for new folders
		// let prefsc = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
		// let prefs = prefsc.getBranch("extensions.ColumnsWizard.DefaultColsList.");
		// let cw_active=prefs.getBoolPref("active");
		let cw_active = miczColumnsWizardPrefsUtils.defaultColsListActive;

		let _bundleCW = Services.strings.createBundle("chrome://columnswizard/locale/overlay.properties");

		// aPopup.childNodes[1].setAttribute('hidden', cw_active ? 'true' : 'false');

		try {
			let element = document.getElementById("columnswizard-defaultmenu");
			if (element) {
				return;
			}
			element.remove();
			element = document.getElementById("columnswizard-resetmenu");
			element.remove();
		} catch (error) {
			// no menus to remove
		}

		// console.debug(aPopup);
		let insertPoint = tc.querySelector("menuseparator").nextSibling;{}
		// console.debug(tc.outerHTML);

		// Add saveDefaultMenuCW element
		let saveDefaultMenuCW = document.createXULElement("menuitem");
		saveDefaultMenuCW.setAttribute('label', _bundleCW.GetStringFromName("ColumnsWizardNFCols.saveDefault"));
		saveDefaultMenuCW.setAttribute('hidden', cw_active ? 'false' : 'true');
		saveDefaultMenuCW.id = "columnswizard-defaultmenu";
		saveDefaultMenuCW.setAttribute("anonid", "menuitem");
		saveDefaultMenuCW.setAttribute("class", "menuitem-iconic");
		saveDefaultMenuCW.setAttribute("image", "chrome://columnswizard/content/ico/saveDefaultMenuCW.png");
		saveDefaultMenuCW.setAttribute("oncommand", "miczColumnsWizard.addCWSaveDefaultMenu_OnClick()");
		
		aPopup.insertBefore(saveDefaultMenuCW, insertPoint);

		// Add resetMenuCw element
		let resetMenuCW = document.createXULElement("menuitem");
		resetMenuCW.id = "columnswizard-resetmenu";
		resetMenuCW.setAttribute('label', _bundleCW.GetStringFromName("ColumnsWizardNFCols.resetMenu"));
		// resetMenuCW.setAttribute('hidden', cw_active ? 'false' : 'true');
		// resetMenuCW.setAttribute('hidden', 'true');
		// resetMenuCW.setAttribute('disabled', 'true');
		resetMenuCW.setAttribute("anonid", "menuitem");
		resetMenuCW.setAttribute("class", "menuitem-iconic");
		resetMenuCW.setAttribute("image", "chrome://columnswizard/content/ico/resetMenuCW.png");
		resetMenuCW.setAttribute("oncommand", "miczColumnsWizard.addCWResetMenu_OnClick()");
		aPopup.insertBefore(resetMenuCW, insertPoint);

		// console.debug('adding menus');
		// console.debug(tc.outerHTML);
		this.originalRestoreCols = insertPoint;

		insertPoint.remove();
		// insertPoint.setAttribute('hidden', 'true');
		// insertPoint.setAttribute('id', 'CW_hidden1');
		// console.debug(tc.outerHTML);
	},	// buildPopup wrapper function END

	removeCWMenus: function () {
		let win = miczColumnsWizard.getMail3Pane();
		win.document.getElementById("columnswizard-resetmenu").remove();
		win.document.getElementById("columnswizard-defaultmenu").remove();

		let tc = document.querySelector("treecolpicker[is=thread-pane-treecolpicker]");
		let tc_menu = tc.querySelector("menupopup");
		let insertPoint = tc.querySelector("menuseparator").nextSibling;
		tc_menu.insertBefore(this.originalRestoreCols, insertPoint);
	},
	
	addCWSaveDefaultMenu_OnClick: function (event) {
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWResetMenu_OnClick] test "+event.target.parentNode.getEventHandler('oncommand')+"\r\n");
		let _bundleCW = Services.strings.createBundle("chrome://columnswizard/locale/overlay.properties");
		let promptService = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
		let title_msg = _bundleCW.GetStringFromName("ColumnsWizardNFCols.saveDefault");
		let text_msg = _bundleCW.GetStringFromName("ColumnsWizard.saveDefault_OnClick_text");
		if (!promptService.confirm(null, title_msg, text_msg)) return;

		let columnStates = gFolderDisplay.getColumnStates();

		const propName = gFolderDisplay.PERSISTED_COLUMN_PROPERTY_NAME;
		let	currentFolder = gFolderDisplay.displayedFolder;
		miczColumnsWizardPrefsUtils.setCharPref_CW("DefaultColsList", JSON.stringify(columnStates));
		window.event.stopPropagation();

		return;
	},

	addCWOptionsMenu: function () {

		var cw_options = document.getElementById('addonPrefs');

		let e2 = cw_options.querySelector('[disabled="true"]');

		let saveDefaultMenuCW = document.createXULElement("menuitem");
		saveDefaultMenuCW.setAttribute('label', 'ColumnsWizard');
		// saveDefaultMenuCW.setAttribute('hidden', 'false');
		saveDefaultMenuCW.id = "columnswizard-optionsitem";
		saveDefaultMenuCW.setAttribute("anonid", "menuitem");
		saveDefaultMenuCW.setAttribute("class", "menuitem-iconic");
		cw_options.insertBefore(saveDefaultMenuCW, e2);
	
		// console.debug(cw_options.outerHTML);
		// console.debug('options menu');
		
	},

	shutdown: function (event) {
		var cw_options = document.getElementById("columnswizard-optionsitem");
		
		cw_options.remove();
	},

	addCWResetMenu_OnClick: function (event) {
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWSaveDefaultMenu_OnClick] test "+event.target.parentNode.getEventHandler('oncommand')+"\r\n");
		
		let _bundleCW = Services.strings.createBundle("chrome://columnswizard/locale/overlay.properties");
		let promptService = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
		let title_msg = _bundleCW.GetStringFromName("ColumnsWizardNFCols.resetMenu");
		let text_msg = _bundleCW.GetStringFromName("ColumnsWizard.resetDefault_OnClick_text");
		if (!promptService.confirm(null, title_msg, text_msg)) return;

		let columnStates = miczColumnsWizardPref_DefaultColsList.loadDefaultColRows_Pref();
		let so = miczColumnsWizardPrefsUtils.getIntPref("mailnews.default_sort_order");
		let st = miczColumnsWizardPrefsUtils.getIntPref("mailnews.default_sort_type");

		gFolderDisplay.view.sort(st, so);
		
		gFolderDisplay.setColumnStates(columnStates, true);
		window.event.stopPropagation();
		return;
	},

	watchFolders: function () {
		let mailSessionService = Cc["@mozilla.org/messenger/services/session;1"].getService(Ci.nsIMsgMailSession);
		mailSessionService.AddFolderListener(miczColumnsWizard.FolderListener, Ci.nsIFolderListener.added);
		// The following are already handled internally
		// mailSessionService.AddFolderListener(FolderListener, Ci.nsIFolderListener.removed);
		// mailSessionService.AddFolderListener(FolderListener, Ci.nsIFolderListener.event);
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [watchFolders] \r\n");
	},

	unwatchFolders: function () {
		// console.debug('unwatchFolders');
		let mailSessionService = Cc["@mozilla.org/messenger/services/session;1"].getService(Ci.nsIMsgMailSession);
		mailSessionService.RemoveFolderListener(miczColumnsWizard.FolderListener);
	},

	// cleidigh have to figure out "new" Menu
	initHeadersEditingMenu: function () {
		// console.debug('UpdateHedgersMenu');
		if (miczColumnsWizardPrefsUtils.headersEditingActive) {
			miczColumnsWizard.CustColPref = miczColumnsWizard_CustCols.loadCustCols();
			miczColumnsWizard_CustomColsModUtils.addContextMenu(document, document.getElementById("cw_edit_main_menu_popup"),
			 document.getElementById("cw_edit_context_menu_popup"),
			 document.getElementById("cw_edit_newmain_menu_popup"),
			 miczColumnsWizard.CustColPref,
			 miczColumnsWizardPrefsUtils.stringCustColIndexMod,
			 miczColumnsWizard.editHeaderMenu_OnClick, miczColumnsWizard.editHeaderSubMenu_OnClick);
			
			document.getElementById("cw_edit_main_menu").setAttribute("hidden", false);
			document.getElementById("cw_edit_context_menu").setAttribute("hidden", false);
			// document.getElementById("cw_edit_newmain_menu").setAttribute("hidden", false);
			// miczLogger.log(">>>>>>>>>>>>> miczColumnsWizard [initHeadersEditingMenu]: Menu UPDATED! \r\n");
		} else {
			document.getElementById("cw_edit_main_menu").setAttribute("hidden", true);
			document.getElementById("cw_edit_context_menu").setAttribute("hidden", true);
			// document.getElementById("cw_edit_newmain_menu").setAttribute("hidden", true);
			// miczLogger.log(">>>>>>>>>>>>> miczColumnsWizard [initHeadersEditingMenu]: Menu HIDDEN! \r\n");
		}
	},

	checkHeadersEditingMenuList: function (event) {
		let element = event.target;

		let current_header = element.parentElement.getAttribute("mail_header");

		let current_header_value = gFolderDisplay.selectedMessage.getStringProperty(current_header);
		// miczLogger.log(">>>>>>>>>>>>> miczColumnsWizard [checkHeadersEditingMenuList] current_header=current_header_value: "+current_header+"="+current_header_value+" \r\n");
		for (let sub_el of Array.from(element.children)) {
			if (current_header_value === sub_el.getAttribute("label")) {
				sub_el.setAttribute('checked', true);
				// miczLogger.log(">>>>>>>>>>>>> miczColumnsWizard [checkHeadersEditingMenuList] sub_el: "+sub_el.getAttribute("label")+" FOUND!!! \r\n");
			} else {
				sub_el.setAttribute('checked', false);
				// miczLogger.log(">>>>>>>>>>>>> miczColumnsWizard [checkHeadersEditingMenuList] sub_el: "+sub_el.getAttribute("label")+" \r\n");
			}
		}
	},

	editHeaderMenu_OnClick: function (event) {
		// miczLogger.log(">>>>>>>>>>>>> miczColumnsWizard: [editHeaderMenu_OnClick] colidx: "+JSON.stringify(event.target.getAttribute("colidx"))+"\r\n");
		event = window.event;
		let colidx = event.target.getAttribute("colidx");
		let mail_header = event.target.getAttribute("mail_header");
		let edit_type = event.target.getAttribute("edit_type");
		// Get the actual value from message
		let msgURI = gFolderDisplay.selectedMessageUris[0];
		miczColumnsWizard_MsgUtils.init(messenger, msgURI, gDBView, msgWindow, window);
		miczColumnsWizard_MsgUtils.setCurrentHeader(mail_header);
		let header_value = miczColumnsWizard_MsgUtils.getMsgHeaderValue(mail_header);
		// Open value editor
		let args = { "action": "change", "value": header_value, "edit_type": edit_type };
		window.openDialog("chrome://columnswizard/content/mzcw-mailheader-editor.xul", "MailHeaderEditor", "chrome,modal,titlebar,resizable,centerscreen", args);
		if ("save" in args && args.save) {
			let output_value = '';
			if ("value" in args && args.value) {
				output_value = args.value;
			}
			// Save the message with the new value
			miczColumnsWizard_MsgUtils.saveMsg(output_value, msgURI, miczColumnsWizard_MsgUtils.listener);
		}
	},

	editHeaderSubMenu_OnClick: function (event) {	// Here editType is always Fixed List
		// miczLogger.log(">>>>>>>>>>>>> miczColumnsWizard: [editHeaderSubMenu_OnClick] colidx: "+JSON.stringify(event.target.getAttribute("colidx")));
		event = window.event;
		let colidx = event.target.getAttribute("colidx");
		let mail_header = event.target.getAttribute("mail_header");
		let header_value = event.target.getAttribute("label");
		let current_header_value = gFolderDisplay.selectedMessage.getStringProperty(mail_header);
		if (header_value === current_header_value) {
			header_value = '';
		}
		let msgURI = gFolderDisplay.selectedMessageUris[0];
		// miczLogger.log(">>>>>>>>>>>>> miczColumnsWizard: [editHeaderSubMenu_OnClick] msgURI SELECTED");
		miczColumnsWizard_MsgUtils.init(messenger, msgURI, gDBView, msgWindow, window);
		// miczLogger.log(">>>>>>>>>>>>> miczColumnsWizard: [editHeaderSubMenu_OnClick] miczColumnsWizard_MsgUtils.init DONE");
		miczColumnsWizard_MsgUtils.setCurrentHeader(mail_header);
		// miczLogger.log(">>>>>>>>>>>>> miczColumnsWizard: [editHeaderSubMenu_OnClick] mail_header SET");
		// Save the message with the new value
		// miczLogger.log(">>>>>>>>>>>>> miczColumnsWizard: [editHeaderSubMenu_OnClick] miczColumnsWizard_MsgUtils.saveMsg CALLING");
		miczColumnsWizard_MsgUtils.saveMsg(header_value, msgURI, miczColumnsWizard_MsgUtils.listener);
		// miczLogger.log(">>>>>>>>>>>>> miczColumnsWizard: [editHeaderSubMenu_OnClick] miczColumnsWizard_MsgUtils.saveMsg DONE");
	},

	updateHeaderEditingMenuObserver: function (ObserverService) {
		let headerEditingMenuObserver = {
			observe: function (aSubject, aTopic, aData) {
				// update header editing menu
				miczColumnsWizard.initHeadersEditingMenu();
				// dump(">>>>>>>>>>>>> miczColumnsWizard: CW-updateHeaderEditingMenu Observer notified! \r\n");
			},
		};
		ObserverService.addObserver(headerEditingMenuObserver, "CW-updateHeaderEditingMenu", false);
	},

	toolbarButtonCommand: function () {
		let features = (miczColumnsWizardUtils.HostSystem === 'linux') ?
			'chrome,titlebar,centerscreen,resizable,dependent,instantApply' :
			'chrome,titlebar,centerscreen,resizable,alwaysRaised,instantApply';
		window.openDialog('chrome://columnswizard/content/settings.xhtml', 'ColumnsWizard_Settings', features).focus();

	},

	// cleidigh fix document persist
	addToolbarButton: function () {
		let toolbar = document.getElementById("mail-bar3");
		let buttonId = "mzcw-button";
		let before_el = document.getElementById("gloda-search").previousSibling;
		if (before_el === null) {
			before_el = document.getElementById("button-appmenu").previousSibling;
		}

		if (!document.getElementById(buttonId)) {
			if (toolbar !== null) {
				toolbar.insertItem(buttonId, before_el);
				toolbar.setAttribute("currentset", toolbar.currentSet);
				// document.persist(toolbar.id, "currentset");
				Services.xulStore.persist(toolbar, "currentset");
			}
		}
	},

	
	getMail3Pane: function () {
		let windowManager = Cc['@mozilla.org/appshell/window-mediator;1']
				.getService(Ci.nsIWindowMediator),
		    win3pane = windowManager.getMostRecentWindow("mail:3pane");
		return win3pane;
	},

	openSettingsTab: function () {

		let url = "chrome://columnswizard/content/settings.html";
		// let url = "resource://cwrl3/chrome/content/settings.html";
		
		// let tabmail = this.getMail3Pane();
		let tabmail = window.document.getElementById("tabmail");
		var tabNode = null;

		// tabmail.tabInfo.forEach(tab => {
		// 	if (tab.browser.contentDocument.URL === url) {
		// 		tabNode = tab.tabNode;
		// 	}
		// });
	
		if (tabNode) {
			tabmail.switchToTab(tabNode);
		} else {
			// tabmail.openTab("chromeTab", { chromePage: url });
			// tabmail.openTab("contentTab", { url });
			// window.openDialog(url);
			window.openDialog(url, "cw","left=50,top=50,width=1100,height=520");
		}
	
	},
	
};

