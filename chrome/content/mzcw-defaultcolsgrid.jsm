"use strict";
var EXPORTED_SYMBOLS = ["miczColumnsWizardPref_DefaultColsGrid"];

const colClass = 'cw-col-class';

var miczColumnsWizardPref_DefaultColsGrid = {

	loadDefaultColRows_Pref:function(){
		let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		let prefs = prefsc.getBranch("extensions.ColumnsWizard.");
		let DefaultColIndexStr=prefs.getCharPref("DefaultColsList");
		let loadedDefaultColIndex=new Array();
		if(DefaultColIndexStr==''){
			//Set default cols if none set at the moment
			loadedDefaultColIndex=this.getOriginalColIndex();
			//dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] default loaded and saved pref\r\n");
			prefs.setCharPref("DefaultColsList",JSON.stringify(loadedDefaultColIndex));
		}else{
			loadedDefaultColIndex=JSON.parse(DefaultColIndexStr);
		}
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] "+JSON.stringify(loadedDefaultColIndex)+"\r\n");
		return loadedDefaultColIndex;
	},

	getOriginalColIndex:function(){
		var wMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		var mainWindow = wMediator.getMostRecentWindow("mail:3pane");
		return mainWindow.gFolderDisplay.getColumnStates();
	},

	createDefaultColsGridHeader: function(doc,container) {
		const XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
		let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
		let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/overlay.properties");
		try {
			if (!container) return;
			while (container.firstChild) container.removeChild(container.firstChild);
			let row = doc.createElementNS(XUL, "row"); // header does not have class colClass
			["A","sort_by", "col_title", "col_flex", "up", "down"].forEach( function(label) {
				let item = doc.createElementNS(XUL, "label");
				//item.setAttribute('value', label ? _bundleCW.GetStringFromName("perfdialog." + label) : "");
				item.setAttribute('value', label);
				//item.setAttribute('rule', label); // header does not have class ruleClass
				if(label=="col_flex")item.setAttribute('hidden',true);
				row.insertBefore(item, null);
			} );
			row.id = container.name+"-header";
			container.insertBefore(row, null);
		}catch(err) {
		  dump(">>>>>>>>>>>>> miczColumnsWizard: [settings createDefaultColsGridHeader] "+err+"\r\n");
		}
	},

	createDefaultColsGridRows: function(doc,container) {
		let DefColRows=this.loadDefaultColRows_Pref();
		for (let index in DefColRows) {
				DefColRows[index]['currindex']=index;
				this.createOneDefaultColRow(doc,container,DefColRows[index]);
		}
	},

	createOneDefaultColRow:function(doc,container,currcol,ref){
		const XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
		//try {
		  if ( !container ) return;
		  let row = doc.createElementNS(XUL, "row");

		  //we found no valid preference
		  if(currcol.visible===undefined)return;

  		  let col_id=doc.createElementNS(XUL, "label");
		  col_id.setAttribute("value", currcol.currindex);
		  col_id.setAttribute("cwcol", 'currindex');
		  col_id.setAttribute("hidden", 'true');

		  let col_enable = doc.createElementNS(XUL, "checkbox");
		  col_enable.setAttribute("checked", currcol.visible);
		  col_enable.setAttribute("cwcol", 'visible');
		  
		  let col_sortby;
		  if(miczColumnsWizardPref_DefaultColsGrid.getSortType(currcol.currindex)!=-1){//SORT BY only if a standard col. No way to save a customcol for sorting
			  col_sortby = doc.createElementNS(XUL, "radio");
			  col_sortby.setAttribute("group", "cw_sortby");
			  col_sortby.setAttribute("value", currcol.currindex);
			  col_sortby.setAttribute("cwcol", 'sortby');
			  col_sortby.setAttribute("type", 'radio');
			  //if(currcol.sortby===undefined)currcol.sortby=false;
			  //if(currcol.sortby)col_sortby.setAttribute("selected", true);
			  let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
			  let prefs = prefsc.getBranch("mailnews.");
			  let sortcolindex=prefs.getIntPref("default_sort_type");
			  if(sortcolindex==miczColumnsWizardPref_DefaultColsGrid.getSortType(currcol.currindex))col_sortby.setAttribute("selected", true);
		  }else{
			  col_sortby = doc.createElementNS(XUL, "label");
			  //col_sortby.setAttribute("hidden", 'true');
			  col_sortby.setAttribute("value", ' ');
		  }
		  
		  
		  
		  let col_title=doc.createElementNS(XUL, "label");
		  col_title.setAttribute("value", this.getColLocalizedString(currcol.currindex));
		  col_title.setAttribute("cwcol", 'col_title');

		  let [col_flex] = [
			// filter, value, size
			["flex", currcol.flex!==undefined?currcol.flex:0, "10"]].map( function(attributes) {
			  let element = doc.createElementNS(XUL, "textbox");
			  let [filter,value,size] = attributes;
			  element.setAttribute("cwcol",filter);
			  if(size) element.setAttribute("size", size);
			  element.setAttribute("value", value);
			  if(filter=="flex")element.setAttribute('hidden',true);
			  return element;
			} );

		  let [up, down] = [
			['\u2191', function(aEvent) { miczColumnsWizardPref_DefaultColsGrid.upDownCol(row, true); }, ''],
			['\u2193', function(aEvent) { miczColumnsWizardPref_DefaultColsGrid.upDownCol(row, false); }, ''] ].map( function(attributes) {
			  let element = doc.createElementNS(XUL, "toolbarbutton");
			  element.setAttribute("label", attributes[0]);
			  element.addEventListener("command", attributes[1], false );
			  if (attributes[2]) element.classList.add(attributes[2]);
			  return element;
			} );

		  row.classList.add(colClass);
		  [col_id, col_enable, col_sortby, col_title, col_flex, up, down].forEach( function(item) {
			row.insertBefore(item, null);
		  } );
		  container.insertBefore(row, ref);
		  //dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid createOneDefaultColRow] "+currindex+"\r\n");
		  return row;
		/*} catch(err) {
		  dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid createOneDefaultColRow error] "+err+"\r\n");
		}*/
	},
	
	saveDefaultColsGridRows: function(doc,container,save_pref) {
		let value = JSON.stringify(this.getDefaultCols(container));
	  	if(save_pref){
		  let preference = doc.getElementById("ColumnsWizard.DefaultColsList");
		  preference.value = value;
    	}
    	return value;
	},

	getDefaultCols:function(container){
	    let cw_cols = {};
	    let ordinal=1;
		//try {
		  if (!container){
			//dump(">>>>>>>>>>>>> miczColumnsWizard: [getDefaultCols] no container\r\n");
		  	return cw_cols;
	  	  }
		  for(let row of container.childNodes){
			if(row.classList.contains(colClass)){
			  let cw_col = this.getOneDefaultCol(row,ordinal);
			  if(Object.keys(cw_col).length>0){
				  cw_cols[cw_col.currindex]=cw_col;
				  //dump(">>>>>>>>>>>>> miczColumnsWizard: [getDefaultCols] added cw_col {"+JSON.stringify(cw_col)+"}\r\n");
			  }
			  ordinal++;
			}
		  }
		//} catch (err) { throw err; } // throw the error out so syncToPerf won't get an empty rules
		return cw_cols;
	},

	getOneDefaultCol: function(row,ordinal) {
		let cwcol= {};
		if(!ordinal)ordinal="0";
	    //let ii=1;
		for(let item of row.childNodes){
		  let key = item.getAttribute('cwcol');
		  if (key){
			let value = item.value || item.checked;
			if (item.getAttribute("type") == 'number') value = item.valueNumber;
			if (item.getAttribute("type") == 'radio'){
				 if(item.selected){
					 let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
					 let prefs = prefsc.getBranch("mailnews.");
					 let sortcolindex=prefs.setIntPref("default_sort_type",miczColumnsWizardPref_DefaultColsGrid.getSortType(cwcol['currindex']));
					 //dump(">>>>>>>>>>>>> miczColumnsWizard: [getOneDefaultCol col_id] "+cwcol['currindex']+"\r\n");
				 }
			 }else{
				cwcol[key] = value;
			 }
			//dump(">>>>>>>>>>>>> miczColumnsWizard: "+ii+" [getOneDefaultCol key|value] "+key+"|"+cwcol[key]+"\r\n");
			//dump(">>>>>>>>>>>>> miczColumnsWizard: [getOneDefaultCol] getting cwcol {"+JSON.stringify(cwcol)+"}\r\n");
			//ii++;
		  }
		}
		cwcol['ordinal']=ordinal;
		 //dump(">>>>>>>>>>>>> miczColumnsWizard: [getOneDefaultCol] get cwcol {"+JSON.stringify(cwcol)+"}\r\n");
		return cwcol;
	  },

  upDownCol: function(row, isUp) {
	  let doc = row.ownerDocument;
	  let container = doc.getElementById('ColumnsWizard.DefaultColsGrid');
    //try {
      let ref = isUp ? row.previousSibling : row;
      let remove = isUp ? row : row.nextSibling;
      if ( ref && remove && ref.classList.contains(colClass) && remove.classList.contains(colClass) ) {
        let cwcol = this.getOneDefaultCol(remove);
        remove.parentNode.removeChild(remove);
        // remove.parentNode.insertBefore(remove, ref); // lost all unsaved values
        let newBox = this.createOneDefaultColRow(doc,container,cwcol,ref);
        //this.checkFocus( isUp ? newBox : row );
        //this.syncToPerf(true);
        this.saveDefaultColsGridRows(doc,container,true);
      }
    /*} catch(err) {
      dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid upDownCol error] "+err+"\r\n");
    }*/
  },

	getColLocalizedString:function(col){
		let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
		let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/settings.properties");
		let strOut=col;

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
       		default:
       		   // TODO after the merge with newprefpanel branch
       		break;
	   }
	   return strOut;
	},

	getSortOrder:function(sort_order){
		let nsMsgViewSortOrder = Components.interfaces.nsMsgViewSortOrder;

		switch (sort_order) {
    	 	case "ASC":
       		return nsMsgViewSortOrder.ascending;
       		break;
       		case "DESC":
       		return nsMsgViewSortOrder.descending;
       		break;
	   }
	   return nsMsgViewSortOrder.ascending;
	},
	
	getSortType:function(col){
		let nsMsgViewSortType = Components.interfaces.nsMsgViewSortType;

		switch (col) {
    	 	case "threadCol":
       		return nsMsgViewSortType.byThread;
       		break;
       		case "senderCol":
       		return nsMsgViewSortType.byAuthor;
       		break;
       		case "recipientCol":
       		return nsMsgViewSortType.byRecipient;
       		break;
       		case "subjectCol":
       		return nsMsgViewSortType.bySubject;
       		break;
       		case "dateCol":
       		return nsMsgViewSortType.byDate;
       		break;
       		case "priorityCol":
       		return nsMsgViewSortType.byPriority;
       		break;
       		case "tagsCol":
       		return nsMsgViewSortType.byTags;
       		break;
       		case "accountCol":
       		return nsMsgViewSortType.byAccount;
       		break;
       		case "statusCol":
       		return nsMsgViewSortType.byStatus;
       		break;
       		case "sizeCol":
       		return nsMsgViewSortType.bySize;
       		break;
       		case "junkStatusCol":
       		return nsMsgViewSortType.byJunkStatus;
       		break;
       		/*case "unreadCol":
       		return nsMsgViewSortType.;
       		break;*/
       		/*case "totalCol":
       		return nsMsgViewSortType.;
       		break;*/
       		case "unreadButtonColHeader":
       		return nsMsgViewSortType.byUnread;
       		break;
       		case "receivedCol":
       		return nsMsgViewSortType.byReceived;
       		break;
       		case "flaggedCol":
       		return nsMsgViewSortType.byFlagged;
       		break;
       		case "locationCol":
       		return nsMsgViewSortType.byLocation;
       		break;
       		case "idCol":
       		return nsMsgViewSortType.byId;
       		break;
       		case "attachmentCol":
       		return nsMsgViewSortType.byAttachments;
       		break;
       		default:
       		//return nsMsgViewSortType.byCustom;
       		//No sorting bycustom at the moment
       		return -1;
       		break;
	   }
	   return strOut;
	},

};



/*
59 interface nsMsgViewSortType
60 {
61   const nsMsgViewSortTypeValue byNone = 0x11; // not sorted
62   const nsMsgViewSortTypeValue byDate = 0x12;
63   const nsMsgViewSortTypeValue bySubject = 0x13;
64   const nsMsgViewSortTypeValue byAuthor = 0x14;
65   const nsMsgViewSortTypeValue byId = 0x15;
66   const nsMsgViewSortTypeValue byThread = 0x16;
67   const nsMsgViewSortTypeValue byPriority = 0x17;
68   const nsMsgViewSortTypeValue byStatus = 0x18;
69   const nsMsgViewSortTypeValue bySize = 0x19;
70   const nsMsgViewSortTypeValue byFlagged = 0x1a;
71   const nsMsgViewSortTypeValue byUnread = 0x1b;
72   const nsMsgViewSortTypeValue byRecipient = 0x1c;
73   const nsMsgViewSortTypeValue byLocation = 0x1d;
74   const nsMsgViewSortTypeValue byTags = 0x1e;
75   const nsMsgViewSortTypeValue byJunkStatus = 0x1f;
76   const nsMsgViewSortTypeValue byAttachments = 0x20;
77   const nsMsgViewSortTypeValue byAccount = 0x21;
78   const nsMsgViewSortTypeValue byCustom = 0x22;
79   const nsMsgViewSortTypeValue byReceived = 0x23;
80 };
*
*
* 469   /**
470    * The custom column to use for sorting purposes (when sort type is
471    *  nsMsgViewSortType.byCustom.)
472
473   attribute AString curCustomColumn;
 *
 * */
