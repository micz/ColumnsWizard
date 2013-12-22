var miczColumnsWizard={};

miczColumnsWizard = {

  showLocation: true,
  showAccount: false,
  showAttachment: false,

	initDelayed: function(){
  	setTimeout(function() { miczColumnsWizard.init(); }, 750);
	},

	init: function() {
	try{
		// Conversation Tab add columns
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
    
    //Adding custom columns
    var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
    ObserverService.addObserver(this.CreateDbObserver, "MsgCreateDBView", false);
    
		this.initialized = true;
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

  CreateDbObserver: {
    // Components.interfaces.nsIObserver
    observe: function(aMsgFolder, aTopic, aData)
                {
                   miczColumnsWizard.addCustomColumnHandler();
                }
  },

	//Cc
  columnHandler_Cc: {
     getCellText:         function(row, col) {alert("qui1");
        //get the message's header so that we can extract the cc to field
        var hdr = gDBView.getMsgHdrAt(row);
        return hdr.getStringProperty("ccList");alert("qui");
     },
     getSortStringForRow: function(hdr) {return hdr.getStringProperty("ccList");},
     isString:            function() {return true;},
     getCellProperties:   function(row, col, props){},
     getRowProperties:    function(row, props){},
     getImageSrc:         function(row, col) {return null;},
     getSortLongForRow:   function(hdr) {return 0;}
  },
  
  addCustomColumnHandler: function() {
     gDBView.addColumnHandler("ccCol_cw", this.columnHandler_Cc);alert("qui2");
  },
  //Cc - END
  
  //Custom columns - END
	
};

window.addEventListener("load", miczColumnsWizard.initDelayed, false);
