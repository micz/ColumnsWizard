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
        // Not a Folder...
        if (!(item instanceof Ci.nsIMsgFolder)) {
            return;
        }
        // If no parent, this is an account
        if (!parent_item) {
            return;
        }
        //if (this.isTrash(item) || this.isVirtual(item) || this.isJunk(item)) {
        if (this.isTrash(item) || this.isJunk(item)) {
            return;
        }
        //TODO
        
    },

    OnItemEvent: function(item, event)
    {
        if (!(item instanceof Ci.nsIMsgFolder)) {
            return;
        }
        //if (this.isTrash(item) || this.isVirtual(item) || this.isJunk(item)) {
        if (this.isTrash(item) || this.isJunk(item)) {
            return;
        }
        if (event.toString() == "RenameCompleted") {
            //TODO
        }
    },

    OnItemRemoved: function (parent_item, item)
    {
        if (!(item instanceof Ci.nsIMsgFolder)) {
            return;
        }
        if (this.isTrash(item) || this.isVirtual(item) || this.isJunk(item)) {
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
};



