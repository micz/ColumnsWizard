"use strict";
miczColumnsWizard.CustCols={
	//Cc
  CreateDbObserver_Cc: {
    // Components.interfaces.nsIObserver
    observe: function(aMsgFolder, aTopic, aData)
                {
                 miczColumnsWizard.CustCols.addCustomColumnHandler_Cc();
                }
  },

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
    var strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
    var _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/overlay.properties");

    switch(coltype){
      case "cc":
          if(document.getElementById("ccCol_cw"))break;
          let labelString = _bundleCW.GetStringFromName("ColumnsWizardCc.label");
          let tooltipString = _bundleCW.GetStringFromName("ColumnsWizardCcDesc.label");
          let ccCol_cw = document.createElement("treecol");
          ccCol_cw.setAttribute("id","ccCol_cw");
          ccCol_cw.setAttribute("persist","hidden ordinal width");
          ccCol_cw.setAttribute("hidden","true");
          ccCol_cw.setAttribute("flex","4");
          ccCol_cw.setAttribute("label",labelString);
          ccCol_cw.setAttribute("tooltiptext",tooltipString);
          let ccSplitter_cw = document.createElement("splitter");
          ccSplitter_cw.setAttribute("class","tree-splitter");
          let element = document.getElementById("threadCols");
          element.appendChild(ccSplitter_cw);
          element.appendChild(ccCol_cw);
        break;
      default: break;
    }
  },
  
    removeCustomColumn: function(coltype){
    switch(coltype){
      case "cc":
          let element = document.getElementById("ccCol_cw");
          if(element) element.parentNode.removeChild(element);
        break;
      default: break;
    }    
  }, 
};
