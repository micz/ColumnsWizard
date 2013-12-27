var miczColumnsWizard = {

  showLocation: true,
  showAccount: false,
  showAttachment: false,
  AddCc: false,

	init: function(){
    //Adding custom columns
    let prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    prefs = prefs.getBranch("extensions.ColumnsWizard.");
    this.AddCc = prefs.getBoolPref("AddCc");
    if(this.AddCc){
      //Add cc custom column
      miczColumnsWizard.addCustomColumn("cc");
      var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
      ObserverService.addObserver(miczColumnsWizard.CreateDbObserver_Cc, "MsgCreateDBView", false);
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
	
	showColumns: function(tab){
    let prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    prefs = prefs.getBranch("extensions.ColumnsWizard.");
    this.showLocation = prefs.getBoolPref("ShowLocation");
    this.showAccount = prefs.getBoolPref("ShowAccount");
    this.showAttachment = prefs.getBoolPref("ShowAttachment");

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
    }
  },
	
	
	//Custom columns
  CreateDbObserver_Cc: {
    // Components.interfaces.nsIObserver
    observe: function(aMsgFolder, aTopic, aData)
                {
                 miczColumnsWizard.addCustomColumnHandler_Cc();
                }
  },

	//Cc
  columnHandler_Cc: {
     getCellText:         function(row, col) {
        //get the message's header so that we can extract the cc to field
        let hdr = gDBView.getMsgHdrAt(row);
        return hdr.getStringProperty("ccList");
     },
     getSortStringForRow: function(hdr) {return hdr.getStringProperty("ccList");},
     isString:            function() {return true;},
     getCellProperties:   function(row, col, props){},
     getRowProperties:    function(row, props){},
     getImageSrc:         function(row, col) {return null;},
     getSortLongForRow:   function(hdr) {return 0;}
  },
  
  addCustomColumnHandler_Cc: function() {
     gDBView.addColumnHandler("ccCol_cw", this.columnHandler_Cc);
  },
  //Cc - END
  
  addCustomColumn: function(coltype){
    switch(coltype){
      case "cc":
          let stringsBundle = document.getElementById("ColumnsWizard-string-bundle");
          let labelString = stringsBundle.getString('ColumnsWizardCc.label');
          let tooltipString = stringsBundle.getString('ColumnsWizardCcDesc.label');
          let ccCol = document.createElement("treecol");
          ccCol.setAttribute("id","ccCol_cw");
          ccCol.setAttribute("persist","hidden ordinal width");
          ccCol.setAttribute("hidden","true");
          ccCol.setAttribute("flex","4");
          ccCol.setAttribute("label",labelString);
          ccCol.setAttribute("tooltiptext",tooltipString);
          let element = document.getElementById("dateCol");
          element.parentNode.insertBefore(ccCol, element.nextSibiling);
        break;
      default: break;
    }    
  },  
  //Custom columns - END
	
};

window.addEventListener("load", miczColumnsWizard.init, false);
