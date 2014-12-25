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
		dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded triggered] "+item.name+"\r\n");
        // Not a Folder...
        if (!(item instanceof Components.interfaces.nsIMsgFolder)) {
			dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded not a folder] "+item.name+"\r\n");
            return;
        }
        // If no parent, this is an account
        if (!parent_item) {
			dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded no parent] "+item.name+"\r\n");
            return;
        }
        //if (this.isTrash(item) || this.isVirtual(item) || this.isJunk(item)) {
        /*if (miczColumnsWizard.FolderListener.isTrash(item) || miczColumnsWizard.FolderListener.isJunk(item)) {
			dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded special folder] "+item.name+"\r\n");
            return;
        }*/
		//TODO
		//this.cw_showColumns(item);
		dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded do it on] "+item.name+"\r\n");
		
		 let propName = gFolderDisplay.PERSISTED_COLUMN_PROPERTY_NAME;
		 dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded propName] "+propName+"\r\n");
		 /*if(!item)dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded no item]\r\n");
		 if(!item.msgDatabase)dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded no item.msgDatabase]\r\n");
		 if(!item.msgDatabase.dBFolderInfo)dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded no item.msgDatabase.dBFolderInfo]\r\n");*/
         let dbFolderInfo = item.msgDatabase.dBFolderInfo;
         //let msgDatabase = item.msgDatabase;
         let cwcolumnStatesString = dbFolderInfo.getCharProperty(propName);
         dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded columnsStateString] "+cwcolumnStatesString+"...\r\n");
         if(cwcolumnStatesString!==false){
			 let cwcolumnStates = JSON.parse(cwcolumnStatesString);
			 dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded columnsStateString parsed]\r\n");
		 }else{
			 let cwcolumnStates=Array();
			 dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded columnsStateString empty Array]\r\n");
		 }
		 cwcolumnStates['ccCol_cw']={visible:true,ordinal:cwcolumnStates['ccCol_cw'].ordinal==0?cwcolumnState.length+1:columnsState['ccCol_cw'].ordinal};
		 dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded columnsStateString NEW] "+JSON.stringify(cwcolumnStates)+"\r\n");
		 dbFolderInfo.setCharProperty(propName,JSON.stringify(cwcolumnStates));
		 item.msgDatabasemsgDatabase.Commit(Components.interfaces.nsMsgDBCommitType.kLargeCommit);
		 
		        /* let cwcolumnStates = item.getColumnStates();
         dump(">>>>>>>>>>>>> miczColumnsWizard: [folder OnItemAdded do it on] "+cwcolumnStatese+"\r\n");
         cwcolumnStates['ccCol_cw']={visible:true,ordinal:cwcolumnStates['ccCol_cw'].ordinal==0?cwcolumnState.length+1:columnsState['ccCol_cw'].ordinal};
         
         item.setColumnStates(cwcolumnStates,false);*/
    },

    OnItemEvent: function(item, event)
    {
        if (!(item instanceof Components.interfaces.nsIMsgFolder)) {
            return;
        }
        //if (this.isTrash(item) || this.isVirtual(item) || this.isJunk(item)) {
        if (miczColumnsWizard.FolderListener.isTrash(item) || miczColumnsWizard.FolderListener.isJunk(item)) {
            return;
        }
        if (event.toString() == "RenameCompleted") {
            //TODO
            miczColumnsWizard.FolderListener.cw_showColumns(item);
        }
    },

    OnItemRemoved: function (parent_item, item)
    {
        if (!(item instanceof Components.interfaces.nsIMsgFolder)) {
            return;
        }
        //if (miczColumnsWizard.FolderListener.isTrash(item) || miczColumnsWizard.FolderListener.isVirtual(item) || miczColumnsWizard.FolderListener.isJunk(item)) {
		if (miczColumnsWizard.FolderListener.isTrash(item) || miczColumnsWizard.FolderListener.isJunk(item)) {
            return;
        }
		//TODO
    },
    
    isInbox: function(folder)
    {
        return folder.isSpecialFolder(FolderFlags.Inbox, false);
    },

    isTrash: function(folder)
    {
        return folder.isSpecialFolder(FolderFlags.Trash, true);
    },

    isVirtual: function(folder, check_parents)
    {
        check_parents = !!check_parents;
        return folder.isSpecialFolder(FolderFlags.Virtual, check_parents);
    },

    isJunk: function(folder)
    {
        return folder.isSpecialFolder(FolderFlags.Junk, true);
    },

    isLeafFolder: function(folder)
    {
        var hasSubFolders = folder.hasSubFolders,
            hasMessages = folder.getTotalMessages(false),
            isSpecial = folder.isSpecialFolder(FolderFlags.Virtual
                                                | FolderFlags.Trash
                                                | FolderFlags.Inbox
                                                | FolderFlags.Junk,
                                                false);
        return !hasSubFolders && !hasMessages;
    },
    
    cw_showColumns: function(item)
    {
        dump(">>>>>>>>>>>>> miczColumnsWizard: [folder added] "+item.name+"\r\n");
        // Get the current folder's columns state
         //let propName = gFolderDisplay.PERSISTED_COLUMN_PROPERTY_NAME;
         //let dbFolderInfo = item.msgDatabase.dBFolderInfo;
         //let columnsStateString = dbFolderInfo.getCharProperty(propName);
         //let columnsState = JSON.parse(columnStateString);
        /*let cwcolumnStates = item.getColumnStates();
         
         cwcolumnStates['ccCol_cw']={visible:true,ordinal:cwcolumnStates['ccCol_cw'].ordinal==0?cwcolumnState.length+1:columnsState['ccCol_cw'].ordinal};
         
         item.setColumnStates(cwcolumnStates,false);*/
	},
};
