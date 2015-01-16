"use strict";
var miczColumnsWizard = {

  //Conversation Tab Columns
  showLocation: true,
  showAccount: false,
  showAttachment: false,
  showRecipient: false,

  //Custom Columns
  CustColPref:{},

	init: function(){
    //Adding custom columns
    var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);

    miczColumnsWizard.CustColPref=miczColumnsWizard.loadCustCols();

    for (let index in miczColumnsWizard.CustColPref) {
      miczColumnsWizard.custColsActivation(miczColumnsWizard.CustColPref[index],index,ObserverService);
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
      onTabSwitched: miczColumnsWizard.addCWResetMenu, //this.showColumns,
      //onTabRestored:function(tab){},
      onTabOpened: this.showColumns,
    };
    tabmail.registerTabMonitor(monitor);
    }catch(e){
      alert("No tabContainer available! " + e);
    }
	},

  loadCustCols:function(){
    let prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    prefs = prefs.getBranch("extensions.ColumnsWizard.CustCols.");
    let loadedCustColPref=new Array();
    loadedCustColPref["cc"]={};
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
    loadedCustColPref["contentbase"].customDBHeader = "content-base";
    return loadedCustColPref;
  },

  custColsActivation:function(element,index,ObserverService){
  //dump(">>>>>>>>>>>>> miczColumnsWizard: [element|index] "+element.Pref+"|"+index+"\r\n");
    if(element.Pref===true){
      miczColumnsWizard.CustCols.addCustomColumn(index,ObserverService);
      if(element.customDBHeader!=false){
        miczColumnsWizard.activateCustomDBHeader(element.customDBHeader);
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
    miczColumnsWizard.addCWResetMenu(tab);
  },

  addCWResetMenu:function(tab){
	/*if(tab.mode.name=='folder'){
		dump(">>>>>>>>>>>>> miczColumnsWizard: [CWColReset tab folder mode] "+tab.mode.name+" \r\n");
		let threadCols=document.getElementById("threadCols");
    	miczColumnsWizard.addCWColumnsResetMenu(threadCols);
	}*/
	if(tab.mode.name=='folder'){
			var cw_colmenubind=document.getAnonymousElementByAttribute(document.getElementById('threadCols'),'class','treecol-image');
		if (!cw_colmenubind.cw_original_buildPopup){
			cw_colmenubind.cw_original_buildPopup=cw_colmenubind.buildPopup;
			dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWResetMenu] tab.cw_colmenubind.buildPopup "+cw_colmenubind.buildPopup+"\r\n");
			dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWResetMenu] FIRST TIME\r\n");
			cw_colmenubind.buildPopup=function(aPopup){ // buildPopup wrapper function START
				dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWResetMenu] "+this.parentNode.parentNode.id+"\r\n");
				//Remove the columns' line... the popupmenu is built again every time from the original function...
				if(aPopup.childNodes.length>4){
					while (aPopup.childNodes.length > 4){
						aPopup.firstChild.remove();
					}
					//... now remove the resetMenuCw id present...
					aPopup.removeChild(aPopup.childNodes[2]);
				}
				cw_colmenubind.cw_original_buildPopup(aPopup);
				let resetMenuCW = document.createElement("menuitem"); //TODO...
				resetMenuCW.setAttribute('label','Reset columns to CW default');
				resetMenuCW.setAttribute("id", "resetCW");
				resetMenuCW.onclick=function(){dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWResetMenu] onclick!\r\n");};
				//resetMenuCW.setAttribute('onclick','dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWResetMenu] onclick!\r\n");');
				aPopup.insertBefore(resetMenuCW,aPopup.lastChild);
			}	// buildPopup wrapper function END
		}
	}
  },

    watchFolders: function(){
		let mailSessionService = Components.classes["@mozilla.org/messenger/services/session;1"].getService(Components.interfaces.nsIMsgMailSession);
        mailSessionService.AddFolderListener(miczColumnsWizard.FolderListener, Components.interfaces.nsIFolderListener.added);
        // The following are already handled internally
        //mailSessionService.AddFolderListener(FolderListener, Ci.nsIFolderListener.removed);
        //mailSessionService.AddFolderListener(FolderListener, Ci.nsIFolderListener.event);
        //dump(">>>>>>>>>>>>> miczColumnsWizard: [watchFolders] \r\n");
    },

    unwatchFolders: function(){
		let mailSessionService = Components.classes["@mozilla.org/messenger/services/session;1"].getService(Components.interfaces.nsIMsgMailSession);
        mailSessionService.RemoveFolderListener(miczColumnsWizard.FolderListener);
    },

    addCWColumnsResetMenu:function(base_element){
		const XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
		let doc=base_element.ownerDocument;
		//if (doc instanceof Ci.nsIDOMDocumentXBL)dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWColumnsResetMenu] ok anon \r\n");
		//let resetMenu = doc.getAnonymousElementByAttribute(base_element, "anonid", "reset");
		let resetMenu = doc.getElementsByAttribute("anonid", "reset");
		dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWColumnsResetMenu] resetMenu "+JSON.stringify(resetMenu)+" \r\n");
		/*let CWColumnsResetMenu=doc.createElementNS(XUL, "menuitem");
		CWColumnsResetMenu.setAttribute("hidden","false");
		CWColumnsResetMenu.setAttribute("label","CW test");
        resetMenu.parent.insertBefore(popupChild,resetMenu);*/
	}

};

window.addEventListener("load", miczColumnsWizard.init, false);
