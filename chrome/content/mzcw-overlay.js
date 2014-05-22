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
    let prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    prefs = prefs.getBranch("extensions.ColumnsWizard.CustCols.");
    let loadedCustColPref=new Array();
    loadedCustColPref["cc"] = prefs.getBoolPref("AddCc");
    loadedCustColPref["cc"].Def = "AddCc";
    loadedCustColPref["bcc"] = prefs.getBoolPref("Addbcc");
    loadedCustColPref["bcc"].Def = "Addbcc";
    return loadedCustColPref;
  },
  
  custColsActivation:function(element,index,ObserverService){
  dump(">>>>>>>>>>>>> miczColumnsWizard: [element|index] "+element+"|"+index+"\r\n");
    if(element===true){
      miczColumnsWizard.CustCols.addCustomColumn(index,ObserverService);
    }
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
  },
	
};

window.addEventListener("load", miczColumnsWizard.init, false);
