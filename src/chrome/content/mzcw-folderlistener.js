"use strict";

// const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
ChromeUtils.import("chrome://columnswizard/content/mzcw-defaultcolsgrid.jsm");
ChromeUtils.import("chrome://columnswizard/content/mzcw-prefsutils.jsm");

miczColumnsWizard.FolderListener = {


    /**
     * Watch for newly created folders. Implements nsIFolderListener.
     *
     * @param nsIMsgFolder parent_folder
     * @param nsISupports  item
     *
     * Thanks to https://github.com/ju1ius for the initial code
     **/
	OnItemAdded: function (parent_item, item) {
		// let prefsc = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
		// let prefs = prefsc.getBranch("extensions.ColumnsWizard.DefaultColsList.");
		// let cw_active=prefs.getBoolPref("active");
		let cw_active = miczColumnsWizardPrefsUtils.defaultColsListActive;

		// dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded triggered] "+item.name+"\r\n");
		// Not a Folder...
		if (!(item instanceof Ci.nsIMsgFolder)) {
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded not a folder] "+item.name+"\r\n");
			return;
		}
		// If no parent, this is an account
		if (!parent_item) {
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded no parent] "+item.name+"\r\n");
			return;
		}
		if (miczColumnsWizard.FolderListener.isTrash(item) || miczColumnsWizard.FolderListener.isJunk(item)) {
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded special folder] "+item.name+"\r\n");
			return;
		}
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded do it on] "+item.name+"\r\n");

		// miczColumnsWizard.FolderListener.cw_showColumns(item);
		if (cw_active) miczColumnsWizard.FolderListener.cw_showColumns_Pref(item);
	},

	OnItemEvent: function (item, event) {
		if (!(item instanceof Ci.nsIMsgFolder)) {
			return;
		}
		if (miczColumnsWizard.FolderListener.isTrash(item) || miczColumnsWizard.FolderListener.isJunk(item)) {
			return;
		}
		if (event.toString() === "RenameCompleted") {
			// Nothing to do here...
			// miczColumnsWizard.FolderListener.cw_showColumns(item);
		}
	},

	OnItemRemoved: function (parent_item, item) {
		if (!(item instanceof Ci.nsIMsgFolder)) {
			return;
		}
		if (miczColumnsWizard.FolderListener.isTrash(item) || miczColumnsWizard.FolderListener.isJunk(item)) {
			return;
		}
		// Nothing to do here...
	},

	isInbox: function (folder) {
		return folder.isSpecialFolder(Ci.nsMsgFolderFlags.Inbox, false);
	},

	isTrash: function (folder) {
		return folder.isSpecialFolder(Ci.nsMsgFolderFlags.Trash, true);
	},

	isVirtual: function (folder, check_parents) {
		check_parents = !!check_parents;
		return folder.isSpecialFolder(Ci.nsMsgFolderFlags.Virtual, check_parents);
	},

	isJunk: function (folder) {
		return folder.isSpecialFolder(Ci.nsMsgFolderFlags.Junk, true);
	},

	isLeafFolder: function (folder) {
		var hasSubFolders = folder.hasSubFolders,
			hasMessages = folder.getTotalMessages(false),
			isSpecial = folder.isSpecialFolder(Ci.nsMsgFolderFlags.Virtual
				| Ci.nsMsgFolderFlags.Trash
				| Ci.nsMsgFolderFlags.Inbox
				| Ci.nsMsgFolderFlags.Junk,
				false);
		return !hasSubFolders && !hasMessages;
	},

	/* cleidigh
	cw_showColumns: function (item) {
		let propName = gFolderDisplay.PERSISTED_COLUMN_PROPERTY_NAME;
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded propName] "+propName+"\r\n");
		let dbFolderInfo = item.msgDatabase.dBFolderInfo;
		let cwcolumnStatesString = dbFolderInfo.getCharProperty(propName);
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded columnsStateString] "+cwcolumnStatesString+"...\r\n");
		let cwcolumnStates = [];
		if (cwcolumnStatesString !== '') {
			cwcolumnStates = JSON.parse(cwcolumnStatesString);
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded columnsStateString parsed]\r\n");
		} else {
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded columnsStateString empty Array]\r\n");
			cwcolumnStates = gFolderDisplay.getColumnStates();
		}
		// Choose which columns we need to always show...
		// For the moment we always show the active custom columns.
		let cwCustColPref = miczColumnsWizard.loadCustCols();
		// Check
		// var Application = Cc["@mozilla.org/steel/application;1"]
        // Services.console.log('services log '+index);
		miczLogger.log("CW "+index);

		let lastordinal = (cwcolumnStates[index + 'ccCol_cw'].ordinal === '0') || (cwcolumnStates['ccCol_cw'].ordinal === 'null') ? (Object.keys(cwcolumnStates).length) + 1 : cwcolumnStates['ccCol_cw'].ordinal;
		lastordinal = (lastordinal % 2) === 0 ? lastordinal + 2 : lastordinal + 1;

		for (let index in cwCustColPref) {
			if (cwCustColPref[index].Pref) {
				if (!(index + 'Col_cw' in cwcolumnStates)) {
					// dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded cwcolumnStates['"+index+"Col_cw'] is false]\r\n");
					cwcolumnStates[index + 'Col_cw'] = { visible: true, ordinal: lastordinal };
				} else {
					// dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded cwcolumnStates['"+index+"Col_cw'].ordinal] "+cwcolumnStates[index+'Col_cw'].ordinal+"\r\n");
					// dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded lastordinal] "+lastordinal+" | "+typeof lastordinal+"\r\n");
					cwcolumnStates[index + 'Col_cw'] = { visible: true, ordinal: lastordinal };
				}
				lastordinal = lastordinal + 2;
			}
		}
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded columnsStateString NEW] "+JSON.stringify(cwcolumnStates)+"\r\n");
		dbFolderInfo.setCharProperty(propName, JSON.stringify(cwcolumnStates));
		item.msgDatabase.Commit(Ci.nsMsgDBCommitType.kLargeCommit);
	},
 */
	cw_showColumns_Pref: function (item) {
		let propName = gFolderDisplay.PERSISTED_COLUMN_PROPERTY_NAME;
		let dbFolderInfo = item.msgDatabase.dBFolderInfo;
		let cwcolumnStates = miczColumnsWizardPref_DefaultColsGrid.loadDefaultColRows_Pref();
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [cw_showColumns_Pref] "+JSON.stringify(cwcolumnStates)+"\r\n");
		dbFolderInfo.setCharProperty(propName, JSON.stringify(cwcolumnStates));
		/* let wMediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
		let mainWindow = wMediator.getMostRecentWindow("mail:3pane");
		let sortedColumn=mainWindow.document.getElementById('ccCol_cw');
		sortedColumn.setAttribute("width","30px");*/
		item.msgDatabase.Commit(Ci.nsMsgDBCommitType.kLargeCommit);
	},

};
