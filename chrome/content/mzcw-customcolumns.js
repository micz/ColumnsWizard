"use strict";
miczColumnsWizard.CustCols={

  addCustomColumnHandler: function(coltype) {
     gDBView.addColumnHandler(coltype+"Col_cw", this["columnHandler_"+coltype]);
  },
  
  addCustomColumn: function(coltype,ObserverService){
    let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
    let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/overlay.properties");

    if(document.getElementById(coltype+"Col_cw")){
      return;
    }
    
    let labelString = _bundleCW.GetStringFromName("ColumnsWizard"+coltype+".label");
    let tooltipString = _bundleCW.GetStringFromName("ColumnsWizard"+coltype+"Desc.label");
    let cwCol = document.createElement("treecol");
    cwCol.setAttribute("id",coltype+"Col_cw");
    cwCol.setAttribute("persist","hidden ordinal width");
    cwCol.setAttribute("hidden","true");
    cwCol.setAttribute("flex","4");
    cwCol.setAttribute("label",labelString);
    cwCol.setAttribute("tooltiptext",tooltipString);
    let cwSplitter = document.createElement("splitter");
    cwSplitter.setAttribute("class","tree-splitter");
    let element = document.getElementById("threadCols");
    element.appendChild(cwSplitter);
    element.appendChild(cwCol);
    
    //DbObserver Managing
    ObserverService.addObserver(miczColumnsWizard.CustCols["CreateDbObserver_"+coltype], "MsgCreateDBView", false);
  },
  
    removeCustomColumn: function(coltype,ObserverService){
      let element = document.getElementById(coltype+"Col_cw");
      if(element) element.parentNode.removeChild(element);
      
      //DbObserver Managing
      ObserverService.removeObserver(miczColumnsWizard.CustCols["CreateDbObserver_"+coltype], "MsgCreateDBView");
    }, 
};

//Create all the needed DbObservers
miczColumnsWizard.CustColPref=miczColumnsWizard.loadCustCols();
for (let index in miczColumnsWizard.CustColPref) {
  dump(">>>>>>>>>>>>> miczColumnsWizard->CreateDbObserver: [index] "+index+"\r\n");
  miczColumnsWizard.CustCols["CreateDbObserver_"+index]={
    // Components.interfaces.nsIObserver
    observe: function(aMsgFolder, aTopic, aData)
                {
                 miczColumnsWizard.CustCols.addCustomColumnHandler(index);
                }
  };
}
//Create all the needed DbObserver - END

//Implement the ColumnHandlers
//cc
miczColumnsWizard.CustCols["columnHandler_cc"]={
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
};
//cc - END
