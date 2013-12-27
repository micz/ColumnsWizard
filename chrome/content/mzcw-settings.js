var miczColumnsWizardPref = {
  AddCc_toggle: function(){alert("qui");
    if(document.getElementById("ColumnsWizard.AddCc_checkbox").checked){
      //checbox checked
      document.miczColumnsWizard.addCustomColumn("cc");
      var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
      ObserverService.addObserver(miczColumnsWizard.CreateDbObserver_Cc, "MsgCreateDBView", false);
    }else{
      //checbox not checked
      document.miczColumnsWizard.removeCustomColumn("cc");
      var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
      ObserverService.removeObserver(miczColumnsWizard.CreateDbObserver_Cc, "MsgCreateDBView");
    }
  },
};
