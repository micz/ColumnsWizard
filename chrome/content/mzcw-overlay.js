var miczColumnsWizard={};

miczColumnsWizard = {

  showLocation: true,
  showAccount: false,
  showAttachment: false,

	init: function() {
	try{
		// initialization code
    let tabmail = document.getElementById("tabmail");
    let monitor = {
      onTabTitleChanged:function(tab){},
      //onTabSwitched: this.showColumns,
      //onTabRestored: this.showColumns,
      onTabOpened: this.showColumns,
    };
    tabmail.registerTabMonitor(monitor);
    }catch(e){
      alert("No tabContainer available! " + e);
    }
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
	
	initDelayed: function(){
  	setTimeout(function() { miczColumnsWizard.init(); }, 750);
	},
};

window.addEventListener("load", miczColumnsWizard.initDelayed, false);
