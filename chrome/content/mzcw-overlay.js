"use strict";
var miczColumnsWizard = {

  //Conversation Tab Columns
  showLocation: true,
  showAccount: false,
  showAttachment: false,
  showRecipient: false,

  //Custom Columns
  //AddCc: false,
  CustColPref:{},
  CustColDef:{},

	init: function(){
    //Adding custom columns
    this.loadCustCols();
    var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);

    CustColPref.forEach(miczColumnsWizard.custColsActivation);
    
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
    this.CustColPref["cc"] = prefs.getBoolPref("AddCc");
    this.CustColDef["cc"]="cc";
  },
  
  custColsActivation:function(element,index,array){
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
