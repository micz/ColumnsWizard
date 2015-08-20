"use strict";
Components.utils.import("chrome://columnswizard/content/mzcw-prefsutils.jsm");
Components.utils.import("chrome://columnswizard/content/mzcw-customcolsmodutils.jsm");

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
		miczColumnsWizard.deleteCustColObserver(ObserverService);
		miczColumnsWizard.updateCustColObserver(ObserverService);

		//Adding custom columns
		miczColumnsWizard.CustColPref=miczColumnsWizard_CustCols.loadCustCols();

		for (let index in miczColumnsWizard.CustColPref) {
			miczColumnsWizard.addDbObserver(miczColumnsWizard.CustColPref[index]);
		}

		for (let index in miczColumnsWizard.CustColPref) {
		  miczColumnsWizard.custColsActivation(miczColumnsWizard.CustColPref[index],ObserverService);
		}

		miczColumnsWizard.watchFolders();
		miczColumnsWizard.initHeadersEditingMenu();

		let current_tab = document.getElementById("tabmail").currentTabInfo;
		miczColumnsWizard.addCWResetMenu(current_tab);

		this.initialized = true;
		//Conversation Tab add columns - delayed
		setTimeout(function() { miczColumnsWizard.initDelayed(); }, 750);
	},

	initDelayed:function(){
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

	addNewCustColObserver:function(ObserverService){
		let CustColObserver = {
			observe: function(aSubject,aTopic,aData){
				//dump(">>>>>>>>>>>>> miczColumnsWizard->CustColObserver: [aSubject] "+aData+"\r\n");
    			miczColumnsWizard.addDbObserver(JSON.parse(aData));
  			}
		}
		ObserverService.addObserver(CustColObserver,"CW-newCustomColumn",false);
	},

	deleteCustColObserver:function(ObserverService){
		let CustColObserver = {
			observe: function(aSubject,aTopic,aData){
				//dump(">>>>>>>>>>>>> miczColumnsWizard->CustColObserver: [aSubject] "+aData+"\r\n");
				let ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
    			miczColumnsWizard_CustCols.removeCustomColumn(aData,ObserverService);
				miczColumnsWizard_CustCols.deleteCustCol(aData);
  			}
		}
		ObserverService.addObserver(CustColObserver,"CW-deleteCustomColumn",false);
	},

	updateCustColObserver:function(ObserverService){
		let CustColObserver = {
			observe: function(aSubject,aTopic,aData){
				//dump(">>>>>>>>>>>>> miczColumnsWizard->CustColObserver: [aSubject] "+aData+"\r\n");
				let ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
    			//update cust col info in the message list
    			miczColumnsWizard_CustCols.updateCustomColumn(JSON.parse(aData));
  			}
		}
		ObserverService.addObserver(CustColObserver,"CW-updateCustomColumn",false);
	},

	addDbObserver:function(currcol){
		//Create all the needed DbObservers
		  //dump(">>>>>>>>>>>>> miczColumnsWizard->CreateDbObserver: [index] "+currcol.index+"\r\n");
		  //It's needed to to this, to avoid writing each miczColumnsWizard_CustCols.CreateDbObserver_COLNAME by hand, because we need to pass the index var inside the observe function definition.
		  let obfunction = function(aMsgFolder,aTopic,aData){miczColumnsWizard_CustCols.addCustomColumnHandler(currcol.index);};
		  miczColumnsWizard_CustCols.CreateDbObserver[currcol.index]={observe: obfunction};
		  //Create all the needed DbObserver - END

		 //Implement all the needed ColumnHandlers
		 let sortfunc = function(hdr) { return hdr.getStringProperty(currcol.dbHeader);};
		 let sortfunc_number = function(hdr) {	//max unsigned long 4294967296-1
									let output=hdr.getStringProperty(currcol.dbHeader)*1000;
									output+=1000000000;
									//dump(">>>>>>>>>>>>> miczColumnsWizard->CreateDbObserver: [output original] "+hdr.getStringProperty(currcol.dbHeader)+"\r\n");
									//dump(">>>>>>>>>>>>> miczColumnsWizard->CreateDbObserver: [output] "+JSON.stringify(output)+"\r\n");
									return output;
			 					};
		 let is_stringfunc = function(hdr) { return !currcol.sortnumber;};
		 let celltextfunc = function(row,col){let hdr = gDBView.getMsgHdrAt(row);return hdr.getStringProperty(currcol.dbHeader);};
//dump(">>>>>>>>>>>>> miczColumnsWizard->CreateDbObserver: [currcol] "+JSON.stringify(currcol)+"\r\n");
		  miczColumnsWizard_CustCols["columnHandler_"+currcol.index]={
			getCellText:         celltextfunc,
			getSortStringForRow: sortfunc,
			isString:            is_stringfunc,
			getCellProperties:   function(row, col, props){},
			getRowProperties:    function(row, props){},
			getImageSrc:         function(row, col) {return null;},
			getSortLongForRow:   sortfunc_number
		  };
		 //Implement all the needed ColumnHandlers - END
	},

    removeCustomColumn: function(coltype,ObserverService){
      let element = document.getElementById(coltype+"Col_cw");
      if(element) element.parentNode.removeChild(element);

      //dump(">>>>>>>>>>>>> miczColumnsWizard->removeCustomColumn: [coltype] "+coltype+"\r\n");
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
      prefService.setCharPref("mailnews.customDBHeaders", currentHeaders.trim());
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
				resetMenuCW.setAttribute("class", "menuitem-iconic");
				resetMenuCW.setAttribute("image","chrome://columnswizard/skin/ico/resetMenuCW.png");
				resetMenuCW.onclick=miczColumnsWizard.addCWResetMenu_OnClick;
				aPopup.insertBefore(resetMenuCW,aPopup.lastChild);

			}	// buildPopup wrapper function END
		}
	}
  },

    addCWSaveDefaultMenu_OnClick:function(event){
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWResetMenu_OnClick] test "+event.target.parentNode.getEventHandler('oncommand')+"\r\n");
		let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
		let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/overlay.properties");
		let promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		let title_msg=_bundleCW.GetStringFromName("ColumnsWizardNFCols.saveDefault");
		let text_msg=_bundleCW.GetStringFromName("ColumnsWizard.saveDefault_OnClick_text");
		if(!promptService.confirm(null,title_msg,text_msg))return;
		let columnStates = gFolderDisplay.getColumnStates();
		let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		let prefs = prefsc.getBranch("extensions.ColumnsWizard.");
		prefs.setCharPref("DefaultColsList",JSON.stringify(columnStates));
		return;
	},

    addCWResetMenu_OnClick:function(event){
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [addCWSaveDefaultMenu_OnClick] test "+event.target.parentNode.getEventHandler('oncommand')+"\r\n");
		let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
		let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/overlay.properties");
		let promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		let title_msg=_bundleCW.GetStringFromName("ColumnsWizardNFCols.resetMenu");
		let text_msg=_bundleCW.GetStringFromName("ColumnsWizard.resetDefault_OnClick_text");
		if(!promptService.confirm(null,title_msg,text_msg))return;
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

    initHeadersEditingMenu:function(){
		if(miczColumnsWizardPrefsUtils.headersEditingActive){
			miczColumnsWizard_CustomColsModUtils.addContextMenu(document,document.getElementById("cw_edit_main_menu_popup"),document.getElementById("cw_edit_context_menu_popup"),document.getElementById("cw_edit_newmain_menu_popup"),miczColumnsWizard.CustColPref,miczColumnsWizard.editHeaderMenu_OnClick,miczColumnsWizard.editHeaderSubMenu_OnClick);
			document.getElementById("cw_edit_main_menu").setAttribute("hidden",false);
			document.getElementById("cw_edit_context_menu").setAttribute("hidden",false);
			document.getElementById("cw_edit_newmain_menu").setAttribute("hidden",false);
		}else{
			document.getElementById("cw_edit_main_menu").setAttribute("hidden",true);
			document.getElementById("cw_edit_context_menu").setAttribute("hidden",true);
			document.getElementById("cw_edit_newmain_menu").setAttribute("hidden",true);
		}
	},
	
	editHeaderMenu_OnClick:function(event){
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [editHeaderMenu_OnClick]: "+JSON.stringify(event.target.getAttribute("colidx"))+"\r\n");
		let colidx=event.target.getAttribute("colidx")
		let mail_haeder=event.target.getAttribute("mail_header");
		let edit_type=event.target.getAttribute("edit_type");
		//TO DO: get the actual value from message
		//TO DO: open value editor
		//let header_value=;
		//TO DO: Save new value
	},
	
	editHeaderSubMenu_OnClick:function(event){	//Here editType is always Fixed List
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [editHeaderSubMenu_OnClick]: "+JSON.stringify(event.target.getAttribute("colidx"))+"\r\n");
		let colidx=event.target.getAttribute("colidx")
		let mail_haeder=event.target.getAttribute("mail_header");
		let header_value=event.target.getAttribute("label");
		//TO DO: Save new value
	},

};

window.addEventListener("load", miczColumnsWizard.init, false);
