"use strict";
var miczColumnsWizard = {

  //Conversation Tab Columns
  showLocation: true,
  showAccount: false,
  showAttachment: false,
  showRecipient: false,

  //Custom Columns
  CustColDefaultIndex:["cc","bcc","replyto","xoriginalfrom","contentbase"],
  CustColPref:{},

	init: function(){
    //Adding custom columns
    var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);

    miczColumnsWizard.CustColPref=miczColumnsWizard.loadCustCols();

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

  loadCustCols:function(){
    let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    let prefs = prefsc.getBranch("extensions.ColumnsWizard.CustCols.");
    let prefs_def = prefsc.getBranch("extensions.ColumnsWizard.CustCols.def.");
    let CustColIndexStr=prefs.getCharPref("index");
    let CustColIndex=new Array();
    if(CustColIndexStr==''){
		//Set default CustColIndex
		CustColIndex=miczColumnsWizard.CustColDefaultIndex;
	}else{
		CustColIndex=JSON.parse(CustColIndexStr);
	}
    let loadedCustColPref=new Array();
    miczColumnsWizard.checkDefaultCustomColumnPrefs();
    for (let singlecolidx in CustColIndex) {
		loadedCustColPref[CustColIndex[singlecolidx]]=JSON.parse(prefs_def.getCharPref(CustColIndex[singlecolidx]));
	}
    
 
    /*loadedCustColPref["cc"]={};
    loadedCustColPref["cc"].Pref = prefs.getBoolPref("AddCc");
    loadedCustColPref["cc"].Def = "AddCc";
    loadedCustColPref["cc"].customDBHeader = false;
    loadedCustColPref["bcc"]={};
    loadedCustColPref["bcc"].Pref = prefs.getBoolPref("Addbcc");
    loadedCustColPref["bcc"].Def = "Addbcc";
    loadedCustColPref["bcc"].customDBHeader = false;
    loadedCustColPref["replyto"]={};
    loadedCustColPref["replyto"].Pref = prefs.getBoolPref("Addreplyto");
    loadedCustColPref["replyto"].Def = "Addreplyto";
    loadedCustColPref["replyto"].customDBHeader = false;
    loadedCustColPref["xoriginalfrom"]={};
    loadedCustColPref["xoriginalfrom"].Pref = prefs.getBoolPref("Addxoriginalfrom");
    loadedCustColPref["xoriginalfrom"].Def = "Addxoriginalfrom";
    loadedCustColPref["xoriginalfrom"].customDBHeader = "x-original-from";
    loadedCustColPref["contentbase"]={};
    loadedCustColPref["contentbase"].Pref = prefs.getBoolPref("Addcontentbase");
    loadedCustColPref["contentbase"].Def = "Addcontentbase";
    loadedCustColPref["contentbase"].customDBHeader = "content-base";*/
    return loadedCustColPref;
  },
  
  custColsActivation:function(element,ObserverService){
  //dump(">>>>>>>>>>>>> miczColumnsWizard: [element|index] "+element.Pref+"|"+index+"\r\n");
    if(element.Enabled===true){
      miczColumnsWizard.CustCols.addCustomColumn(element,ObserverService);
      if(element.iscustom!=false){
        miczColumnsWizard.activateCustomDBHeader(element.DBHeader);
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
    
    checkDefaultCustomColumnPrefs: function(){
		let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		let prefs = prefsc.getBranch("extensions.ColumnsWizard.CustCols.");
		let prefs_def = prefsc.getBranch("extensions.ColumnsWizard.CustCols.def.");
		
		for (let singlecolidx in miczColumnsWizard.CustColDefaultIndex) {
			dump(">>>>>>>>>>>>> miczColumnsWizard: [checkDefaultCustomColumnPrefs singlecolidx] "+miczColumnsWizard.CustColDefaultIndex[singlecolidx]+" \r\n");
			let currcol=prefs_def.getCharPref(miczColumnsWizard.CustColDefaultIndex[singlecolidx]);
			if(currcol==''){//Default custom column pref not present
				let dcurrcol={}
				switch(miczColumnsWizard.CustColDefaultIndex[singlecolidx]){
					case 'cc':
						dcurrcol.Enabled = prefs.getBoolPref("AddCc");
						dcurrcol.ShowNewFolder=false;
						dcurrcol.Def = "AddCc";
						dcurrcol.DBHeader = "ccList";
						dcurrcol.iscustom=false;
						break;
					case 'bcc':
						dcurrcol.Enabled = prefs.getBoolPref("Addbcc");
						dcurrcol.ShowNewFolder=false;
						dcurrcol.Def = "Addbcc";
						dcurrcol.DBHeader = "bccList";
						dcurrcol.iscustom=false;
						break;
					case 'replyto':
						dcurrcol.Enabled = prefs.getBoolPref("Addreplyto");
						dcurrcol.ShowNewFolder=false;
						dcurrcol.Def = "Addreplyto";
						dcurrcol.DBHeader = "replyTo";
						dcurrcol.iscustom=false;
						break;
					case 'xoriginalfrom':
						dcurrcol.Enabled = prefs.getBoolPref("Addxoriginalfrom");
						dcurrcol.ShowNewFolder=false;
						dcurrcol.Def = "Addxoriginalfrom";
						dcurrcol.DBHeader = "x-original-from";
						dcurrcol.iscustom=true;
						break;
					case 'contentbase':
						dcurrcol.Enabled = prefs.getBoolPref("Addcontentbase");
						dcurrcol.ShowNewFolder=false;
						dcurrcol.Def = "Addcontentbase";
						dcurrcol.DBHeader = "content-base";
						dcurrcol.iscustom=true;
						break;
				}
				dcurrcol.index=miczColumnsWizard.CustColDefaultIndex[singlecolidx];
				dcurrcol.isbundled=true;
				dcurrcol.labelString='';
				dcurrcol.tooltipString='';
				prefs_def.setCharPref(miczColumnsWizard.CustColDefaultIndex[singlecolidx],JSON.stringify(dcurrcol));
			}
		}
	},

};

window.addEventListener("load", miczColumnsWizard.init, false);
