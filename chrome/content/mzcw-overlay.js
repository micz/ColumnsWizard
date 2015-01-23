"use strict";
//Components.utils.import("chrome://columnswizard/content/mzcw-customcolumns.jsm");

var miczColumnsWizard = {

  //Conversation Tab Columns
  showLocation: true,
  showAccount: false,
  showAttachment: false,
  showRecipient: false,

  //Custom Columns
  CustColPref:{},

	init: function(){
		let ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);

		miczColumnsWizard.addNewCustColObserver(ObserverService);

		//Adding custom columns
		miczColumnsWizard.CustColPref=miczColumnsWizard_CustCols.loadCustCols();

		for (let index in miczColumnsWizard.CustColPref) {
			miczColumnsWizard.addDbObserver(miczColumnsWizard.CustColPref[index]);
		}

		for (let index in miczColumnsWizard.CustColPref) {
		  miczColumnsWizard.custColsActivation(miczColumnsWizard.CustColPref[index],ObserverService);
		}

		miczColumnsWizard.watchFolders();

		this.initialized = true;
		//Conversation Tab add columns - delayed
		setTimeout(function() { miczColumnsWizard.initDelayed(); }, 750);
	},

	initDelayed: function() {
		try{
			//Conversation Tab add columns
		let tabmail = document.getElementById("tabmail");
		let monitor = {
		  onTabTitleChanged:function(tab){},
		  onTabSwitched: function(tab){}, //this.showColumns,
		  //onTabRestored: this.showColumns,
		  onTabOpened: this.showColumns,
		};
		tabmail.registerTabMonitor(monitor);
		}catch(e){
		  alert("No tabContainer available! " + e);
		}
	},

	addNewCustColObserver:function(ObserverService){
		let CustColObserver = {
			observe: function(aSubject,aTopic,aData){
				//dump(">>>>>>>>>>>>> miczColumnsWizard->CustColObserver: [aSubject] "+aData+"\r\n");
    			miczColumnsWizard.addDbObserver(JSON.parse(aData));
  			}
		}
		ObserverService.addObserver(CustColObserver,"CW-newCustomColumn",false);
	},

	addDbObserver:function(currcol){
		//Create all the needed DbObservers
		  //dump(">>>>>>>>>>>>> miczColumnsWizard->CreateDbObserver: [index] "+currcol.index+"\r\n");
		  //It's needed to to this, to avoid writing each miczColumnsWizard_CustCols.CreateDbObserver_COLNAME by hand, because we need to pass the index var inside the observe function definition.
		  let obfunction=new Function('aMsgFolder', 'aTopic', 'aData',"miczColumnsWizard_CustCols.addCustomColumnHandler('"+currcol.index+"');");
		  miczColumnsWizard_CustCols.CreateDbObserver[currcol.index]={observe: obfunction};
		  //Create all the needed DbObserver - END

		 //Implement all the needed ColumnHandlers
		 let sortfunc=new Function('hdr','return hdr.getStringProperty("'+currcol.dbHeader+'");');
		 let celltextfunc=new Function('row','col','let hdr = gDBView.getMsgHdrAt(row);return hdr.getStringProperty("'+currcol.dbHeader+'");');

		  miczColumnsWizard_CustCols["columnHandler_"+currcol.index]={
			getCellText:         celltextfunc,
			getSortStringForRow: sortfunc,
			isString:            function() {return true;},
			getCellProperties:   function(row, col, props){},
			getRowProperties:    function(row, props){},
			getImageSrc:         function(row, col) {return null;},
			getSortLongForRow:   function(hdr) {return 0;}
		  };
		 //Implement all the needed ColumnHandlers - END
	},

/*  addCustomColumnHandler: function(coltype) {
     gDBView.addColumnHandler(coltype+"Col_cw", miczColumnsWizard_CustCols["columnHandler_"+coltype]);
  },

  addCustomColumn: function(elementc,ObserverService){
    let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
    let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/overlay.properties");

	let coltype=elementc.index;

    if(document.getElementById(coltype+"Col_cw")){
      return;
    }

    let labelString = '';
    let tooltipString = '';
    if(elementc.isBundled){
		labelString = _bundleCW.GetStringFromName("ColumnsWizard"+coltype+".label");
		tooltipString = _bundleCW.GetStringFromName("ColumnsWizard"+coltype+"Desc.label");
	}else{
		labelString = elementc.labelString;
		tooltipString = elementc.tooltipString;
	}
    let cwCol = document.createElement("treecol");
    cwCol.setAttribute("id",coltype+"Col_cw");
    cwCol.setAttribute("persist","hidden ordinal width");
    cwCol.setAttribute("hidden","true");
    cwCol.setAttribute("flex","4");
    cwCol.setAttribute("label",labelString);
    cwCol.setAttribute("tooltiptext",tooltipString);
    let cwSplitter = document.createElement("splitter");
    cwSplitter.setAttribute("class","tree-splitter");
    cwSplitter.setAttribute("resizeafter","farthest");
    let element = document.getElementById("threadCols");
    let lastordinal=element.children.length;
    //dump('>>>>>>>>> columns [js children: '+lastordinal+"] [real: "+(lastordinal-1)/2+"]\r\n");
    cwSplitter.setAttribute("ordinal",lastordinal+1);
    element.appendChild(cwSplitter);
    element.appendChild(cwCol);

    //dump(">>>>>>>>>>>>> miczColumnsWizard->addCustomColumn: [coltype] "+coltype+"\r\n");
    //DbObserver Managing
    ObserverService.addObserver(miczColumnsWizard_CustCols.CreateDbObserver[coltype], "MsgCreateDBView", false);
  },*/

    removeCustomColumn: function(coltype,ObserverService){
      let element = document.getElementById(coltype+"Col_cw");
      if(element) element.parentNode.removeChild(element);

      dump(">>>>>>>>>>>>> miczColumnsWizard->removeCustomColumn: [coltype] "+coltype+"\r\n");
      //DbObserver Managing
      try{
      	ObserverService.removeObserver(miczColumnsWizard_CustCols.CreateDbObserver[coltype], "MsgCreateDBView");
      }catch(ex){
		//No observer found
	  }
    },

  custColsActivation:function(element,ObserverService){
  //dump(">>>>>>>>>>>>> miczColumnsWizard: [element|index] "+element.Pref+"|"+index+"\r\n");
    if(element.enabled===true){
      miczColumnsWizard_CustCols.addCustomColumn(element,ObserverService);
      if(element.isCustom!=false){
        miczColumnsWizard.activateCustomDBHeader(element.dbHeader);
      }
    }
  },

  activateCustomDBHeader:function(newHeader){
    //dump(">>>>>>>>>>>>> miczColumnsWizard: [customDBHeaders] "+newHeader+"\r\n");
    let prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    let currentHeaders = prefService.getCharPref("mailnews.customDBHeaders");
    let re = new RegExp("(^| )"+newHeader+"( |$)","i");
    if (currentHeaders.search(re) < 0) {
      currentHeaders = currentHeaders + " "+newHeader;
      prefService.setCharPref("mailnews.customDBHeaders", currentHeaders);
      //dump(">>>>>>>>>>>>> miczColumnsWizard: [customDBHeaders->Updating] "+newHeader+"\r\n");
    }
  },

  deactivateCustomDBHeader:function(newHeader){
    //dump(">>>>>>>>>>>>> miczColumnsWizard: [deactivate customDBHeaders] "+newHeader+"\r\n");
    let prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    let currentHeaders = prefService.getCharPref("mailnews.customDBHeaders");
    let re = new RegExp("(^| )"+newHeader+"( |$)","i");
    currentHeaders=currentHeaders.replace(re," ");
    prefService.setCharPref("mailnews.customDBHeaders", currentHeaders);
    //dump(">>>>>>>>>>>>> miczColumnsWizard: [deactivate customDBHeaders->Updating] "+newHeader+"\r\n");
  },

	showColumns: function(tab){
    let prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    prefs = prefs.getBranch("extensions.ColumnsWizard.");
    this.showLocation = prefs.getBoolPref("ShowLocation");
    this.showAccount = prefs.getBoolPref("ShowAccount");
    this.showAttachment = prefs.getBoolPref("ShowAttachment");
    this.showRecipient = prefs.getBoolPref("ShowRecipient");

	  if(tab.mode.name=='glodaList'){
	  if(this.showLocation){ //show location column
      let loccv = document.getElementById("locationCol");
      if(loccv) loccv.setAttribute("hidden", "false");
     }
     if(this.showAccount){ //show account column
      let accountcv = document.getElementById("accountCol");
      if(accountcv) accountcv.setAttribute("hidden", "false");
     }
     if(this.showAttachment){ //show attachment column
      let attachcv = document.getElementById("attachmentCol");
      if(attachcv) attachcv.setAttribute("hidden", "false");
     }
     if(this.showRecipient){ //show recipient column
      let recipientcv = document.getElementById("recipientCol");
      if(recipientcv) recipientcv.setAttribute("hidden", "false");
     }
    }
    //dump(">>>>>>>>>>>>> miczColumnsWizard: [tab folder mode] "+tab.mode.name+" \r\n");
  },

    watchFolders: function(){
		let mailSessionService = Components.classes["@mozilla.org/messenger/services/session;1"].getService(Components.interfaces.nsIMsgMailSession);
        mailSessionService.AddFolderListener(miczColumnsWizard.FolderListener, Components.interfaces.nsIFolderListener.added);
        // The following are already handled internally
        //mailSessionService.AddFolderListener(FolderListener, Ci.nsIFolderListener.removed);
        //mailSessionService.AddFolderListener(FolderListener, Ci.nsIFolderListener.event);
        dump(">>>>>>>>>>>>> miczColumnsWizard: [watchFolders] \r\n");
    },

    unwatchFolders: function(){
		let mailSessionService = Components.classes["@mozilla.org/messenger/services/session;1"].getService(Components.interfaces.nsIMsgMailSession);
        mailSessionService.RemoveFolderListener(miczColumnsWizard.FolderListener);
    },

};

window.addEventListener("load", miczColumnsWizard.init, false);


/*
miczColumnsWizard.CustColPref=miczColumnsWizard_CustCols.loadCustCols();
//miczColumnsWizard_CustCols.CreateDbObserver=Array();
for (let index in miczColumnsWizard.CustColPref) {
  //Create all the needed DbObservers
  //dump(">>>>>>>>>>>>> miczColumnsWizard->CreateDbObserver: [index] "+index+"\r\n");
  //It's needed to to this, to avoid writing each miczColumnsWizard_CustCols.CreateDbObserver_COLNAME by hand, because we need to pass the index var inside the observe function definition.
  let obfunction=new Function('aMsgFolder', 'aTopic', 'aData',"miczColumnsWizard_CustCols.addCustomColumnHandler('"+index+"');");
  miczColumnsWizard_CustCols.CreateDbObserver[index]={observe: obfunction};
  //Create all the needed DbObserver - END

 //Implement all the needed ColumnHandlers
 let sortfunc=new Function('hdr','return hdr.getStringProperty("'+miczColumnsWizard.CustColPref[index].dbHeader+'");');
 let celltextfunc=new Function('row','col','let hdr = gDBView.getMsgHdrAt(row);return hdr.getStringProperty("'+miczColumnsWizard.CustColPref[index].dbHeader+'");');

  miczColumnsWizard_CustCols["columnHandler_"+index]={
    getCellText:         celltextfunc,
    getSortStringForRow: sortfunc,
    isString:            function() {return true;},
    getCellProperties:   function(row, col, props){},
    getRowProperties:    function(row, props){},
    getImageSrc:         function(row, col) {return null;},
    getSortLongForRow:   function(hdr) {return 0;}
  };
 //Implement all the needed ColumnHandlers - END
}
*/