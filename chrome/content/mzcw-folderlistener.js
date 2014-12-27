"use strict";
miczColumnsWizard.FolderListener={


    /**
     * Watch for newly created folders. Implements nsIFolderListener.
     *
     * @param nsIMsgFolder parent_folder
     * @param nsISupports  item
     * 
     * Thanks to https://github.com/ju1ius
     **/
    OnItemAdded: function(parent_item, item)
    {
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded triggered] "+item.name+"\r\n");
        // Not a Folder...
        if (!(item instanceof Components.interfaces.nsIMsgFolder)) {
			//dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded not a folder] "+item.name+"\r\n");
            return;
        }
        // If no parent, this is an account
        if (!parent_item) {
			//dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded no parent] "+item.name+"\r\n");
            return;
        }
        if (miczColumnsWizard.FolderListener.isTrash(item) || miczColumnsWizard.FolderListener.isJunk(item)) {
			//dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded special folder] "+item.name+"\r\n");
            return;
        }
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded do it on] "+item.name+"\r\n");
		
		miczColumnsWizard.FolderListener.cw_showColumns(item);
    },

    OnItemEvent: function(item, event)
    {
        if (!(item instanceof Components.interfaces.nsIMsgFolder)) {
            return;
        }
        if (miczColumnsWizard.FolderListener.isTrash(item) || miczColumnsWizard.FolderListener.isJunk(item)) {
            return;
        }
        if (event.toString() == "RenameCompleted") {
            //Nothing to do here...
            //miczColumnsWizard.FolderListener.cw_showColumns(item);
        }
    },

    OnItemRemoved: function (parent_item, item)
    {
        if (!(item instanceof Components.interfaces.nsIMsgFolder)) {
            return;
        }
		if (miczColumnsWizard.FolderListener.isTrash(item) || miczColumnsWizard.FolderListener.isJunk(item)) {
            return;
        }
		//Nothing to do here...
    },
    
    isInbox: function(folder)
    {
        return folder.isSpecialFolder(Components.interfaces.nsMsgFolderFlags.Inbox, false);
    },

    isTrash: function(folder)
    {
        return folder.isSpecialFolder(Components.interfaces.nsMsgFolderFlags.Trash, true);
    },

    isVirtual: function(folder, check_parents)
    {
        check_parents = !!check_parents;
        return folder.isSpecialFolder(Components.interfaces.nsMsgFolderFlags.Virtual, check_parents);
    },

    isJunk: function(folder)
    {
        return folder.isSpecialFolder(Components.interfaces.nsMsgFolderFlags.Junk, true);
    },

    isLeafFolder: function(folder)
    {
        var hasSubFolders = folder.hasSubFolders,
            hasMessages = folder.getTotalMessages(false),
            isSpecial = folder.isSpecialFolder(Components.interfaces.nsMsgFolderFlags.Virtual
                                                | Components.interfaces.nsMsgFolderFlags.Trash
                                                | Components.interfaces.nsMsgFolderFlags.Inbox
                                                | Components.interfaces.nsMsgFolderFlags.Junk,
                                                false);
        return !hasSubFolders && !hasMessages;
    },
    
    cw_showColumns_cc_only: function(item)
    {
		 let propName = gFolderDisplay.PERSISTED_COLUMN_PROPERTY_NAME;
		 dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded propName] "+propName+"\r\n");
         let dbFolderInfo = item.msgDatabase.dBFolderInfo;
         let cwcolumnStatesString = dbFolderInfo.getCharProperty(propName);
         dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded columnsStateString] "+cwcolumnStatesString+"...\r\n");
         let cwcolumnStates=Array();
         if(cwcolumnStatesString!=''){
			 cwcolumnStates = JSON.parse(cwcolumnStatesString);
			 dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded columnsStateString parsed]\r\n");
		 }else{
			 dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded columnsStateString empty Array]\r\n");
			 cwcolumnStates=gFolderDisplay.getColumnStates();
		 }
		 if(!('ccCol_cw' in cwcolumnStates)){
			 dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded cwcolumnStates['ccCol_cw'] is false]\r\n");
			cwcolumnStates['ccCol_cw']={visible:true,ordinal:''};
		 }
		 dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded cwcolumnStates['ccCol_cw'].ordinal] "+cwcolumnStates['ccCol_cw'].ordinal+"\r\n");
		 //There is no need to set an ordinal...
		 //let lastordinal=(cwcolumnStates['ccCol_cw'].ordinal=='0')||(cwcolumnStates['ccCol_cw'].ordinal=='null')?(Object.keys(cwcolumnStates).length)+1:cwcolumnStates['ccCol_cw'].ordinal;
		 //dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded lastordinal] "+lastordinal+" | "+typeof lastordinal+"\r\n");
		 let lastordinalstr='';//lastordinal.toString();
		 cwcolumnStates['ccCol_cw']={visible:true,ordinal:lastordinalstr};
		 dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded columnsStateString NEW] "+JSON.stringify(cwcolumnStates)+"\r\n");
		 dbFolderInfo.setCharProperty(propName,JSON.stringify(cwcolumnStates));
		 item.msgDatabase.Commit(Components.interfaces.nsMsgDBCommitType.kLargeCommit);
	},
	
	cw_showColumns: function(item){
		 let propName = gFolderDisplay.PERSISTED_COLUMN_PROPERTY_NAME;
		 dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded propName] "+propName+"\r\n");
         let dbFolderInfo = item.msgDatabase.dBFolderInfo;
         let cwcolumnStatesString = dbFolderInfo.getCharProperty(propName);
         dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded columnsStateString] "+cwcolumnStatesString+"...\r\n");
         let cwcolumnStates=Array();
         if(cwcolumnStatesString!=''){
			 cwcolumnStates = JSON.parse(cwcolumnStatesString);
			 dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded columnsStateString parsed]\r\n");
		 }else{
			 dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded columnsStateString empty Array]\r\n");
			 cwcolumnStates=gFolderDisplay.getColumnStates();
		 }
		 //Choose which columns we need to always show...
		 //For the moment we always show the active custom columns.
		 let cwCustColPref=miczColumnsWizard.loadCustCols();
		 for (let index in cwCustColPref) {
			 if(cwCustColPref[index].Pref){
				 if(!(index+'Col_cw' in cwcolumnStates)){
					 dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded cwcolumnStates['"+index+"Col_cw'] is false]\r\n");
					cwcolumnStates[index+'Col_cw']={visible:true,ordinal:''};
				 }
				 dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded cwcolumnStates['"+index+"Col_cw'].ordinal] "+cwcolumnStates[index+'Col_cw'].ordinal+"\r\n");
				 //There is no need to set an ordinal...
				 //let lastordinal=(cwcolumnStates['ccCol_cw'].ordinal=='0')||(cwcolumnStates['ccCol_cw'].ordinal=='null')?(Object.keys(cwcolumnStates).length)+1:cwcolumnStates['ccCol_cw'].ordinal;
				 //dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded lastordinal] "+lastordinal+" | "+typeof lastordinal+"\r\n");
				 let lastordinalstr='';//lastordinal.toString();
				 cwcolumnStates[index+'Col_cw']={visible:true,ordinal:lastordinalstr};
			 }
		 }
		 dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded columnsStateString NEW] "+JSON.stringify(cwcolumnStates)+"\r\n");
		 dbFolderInfo.setCharProperty(propName,JSON.stringify(cwcolumnStates));
		 item.msgDatabase.Commit(Components.interfaces.nsMsgDBCommitType.kLargeCommit);
	},
};
