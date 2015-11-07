"use strict";
Components.utils.import("chrome://columnswizard/content/mzcw-prefsutils.jsm");
Components.utils.import("chrome://columnswizard/content/mzcw-customcolsmodutils.jsm");
Components.utils.import("chrome://columnswizard/content/mzcw-msgutils.jsm");
Components.utils.import("chrome://columnswizard/content/mzcw-utils.jsm");

var miczColumnsWizardSearchDialog = {

  //Conversation Tab Columns
  showLocation: true,
  showAccount: false,
  showAttachment: false,
  showRecipient: false,

  CustColPref:{},

	init: function(){

		let ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);

		//Adding custom columns
		miczColumnsWizardSearchDialog.CustColPref=miczColumnsWizard_CustCols.loadCustCols();

		//The columns must be set at window opening. No need for an observer.
		for (let index in miczColumnsWizardSearchDialog.CustColPref) {
			miczColumnsWizardSearchDialog.addDbObserver(miczColumnsWizardSearchDialog.CustColPref[index]);
		}

		for (let index in miczColumnsWizardSearchDialog.CustColPref) {
		  miczColumnsWizardSearchDialog.custColsActivation(miczColumnsWizardSearchDialog.CustColPref[index],ObserverService);
		}

		//miczColumnsWizard.initHeadersEditingMenu();

		miczColumnsWizardSearchDialog.addCWResetMenu();

		this.initialized = true;
	},
	
	custColsActivation:function(element,ObserverService){
	//dump(">>>>>>>>>>>>> miczColumnsWizard: [element|index] "+element.Pref+"|"+index+"\r\n");
		if(element.enabled===true){
			miczColumnsWizard_CustCols.addCustomColumn(element,ObserverService);
		}
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

};

window.addEventListener("load", miczColumnsWizardSearchDialog.init, false);
