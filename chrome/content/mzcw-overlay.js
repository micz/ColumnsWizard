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
    
    let current_tab = document.getElementById("tabmail").currentTabInfo;
    miczColumnsWizard.addCWResetMenu(current_tab);

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
	if(tab.mode.name=='folder'){
		var cw_colmenubind=document.getAnonymousElementByAttribute(document.getElementById('threadCols'),'class','treecol-image');
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWResetMenu] tab.cw_colmenubind.command "+cw_colmenubind.oncommand+"\r\n");
		if (!cw_colmenubind.cw_original_buildPopup){
			cw_colmenubind.cw_original_buildPopup=cw_colmenubind.buildPopup;
			//dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWResetMenu] tab.cw_colmenubind.buildPopup "+cw_colmenubind.buildPopup+"\r\n");
			//dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWResetMenu] FIRST TIME\r\n");
			cw_colmenubind.buildPopup=function(aPopup){ // buildPopup wrapper function START
				//dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWResetMenu] "+this.parentNode.parentNode.id+"\r\n");
				//Remove the columns' line... the popupmenu is built again every time from the original function...
				if(aPopup.childNodes.length >= 5){
					while (aPopup.childNodes.length > 5){
						aPopup.firstChild.remove();
					}
					//... now remove the resetMenuCW and saveDefaultMenuCW items...
					aPopup.removeChild(aPopup.childNodes[2]);
					aPopup.removeChild(aPopup.childNodes[2]);
				}
				//check if we're using the colcw default for new folders
				let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
				let prefs = prefsc.getBranch("extensions.ColumnsWizard.DefaultColsList.");
				let cw_active=prefs.getBoolPref("active");
				
				let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
				let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/overlay.properties");
				
				aPopup.childNodes[1].setAttribute('hidden',cw_active?'true':'false');
				
				cw_colmenubind.cw_original_buildPopup(aPopup);
				
				//Add saveDefaultMenuCW element
				let saveDefaultMenuCW = document.createElement("menuitem");
				saveDefaultMenuCW.setAttribute('label',_bundleCW.GetStringFromName("ColumnsWizardNFCols.saveDefault"));
				saveDefaultMenuCW.setAttribute('hidden',cw_active?'false':'true');
				//we do this to escape the command xbl event handler
				saveDefaultMenuCW.setAttribute("colindex", "-1");
				saveDefaultMenuCW.setAttribute("class", "menuitem-iconic");
				saveDefaultMenuCW.setAttribute("image","chrome://columnswizard/skin/ico/saveDefaultMenuCW.png");
				saveDefaultMenuCW.onclick=miczColumnsWizard.addCWSaveDefaultMenu_OnClick;
				aPopup.insertBefore(saveDefaultMenuCW,aPopup.lastChild);

				//Add resetMenuCw element
				let resetMenuCW = document.createElement("menuitem");
				resetMenuCW.setAttribute('label',_bundleCW.GetStringFromName("ColumnsWizardNFCols.resetMenu"));
				resetMenuCW.setAttribute('hidden',cw_active?'false':'true');
				//we do this to escape the command xbl event handler
				resetMenuCW.setAttribute("colindex", "-1");
				resetMenuCW.onclick=miczColumnsWizard.addCWResetMenu_OnClick;
				aPopup.insertBefore(resetMenuCW,aPopup.lastChild);
				
			}	// buildPopup wrapper function END
		}
	}
  },
  
    addCWSaveDefaultMenu_OnClick:function(event){
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWResetMenu_OnClick] test "+event.target.parentNode.getEventHandler('oncommand')+"\r\n");
		let columnStates = gFolderDisplay.getColumnStates();
		let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		let prefs = prefsc.getBranch("extensions.ColumnsWizard.");
		prefs.setCharPref("DefaultColsList",JSON.stringify(columnStates));
		return;
	},

    addCWResetMenu_OnClick:function(event){
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWSaveDefaultMenu_OnClick] test "+event.target.parentNode.getEventHandler('oncommand')+"\r\n");
		let columnStates = miczColumnsWizardPref_DefaultColsGrid.loadDefaultColRows_Pref();
		gFolderDisplay.setColumnStates(columnStates, true);
		return;
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

};

window.addEventListener("load", miczColumnsWizard.init, false);
