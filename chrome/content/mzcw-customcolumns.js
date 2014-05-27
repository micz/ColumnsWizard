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
  //It's needed to to this, to avoid writing each miczColumnsWizard.CustCols.CreateDbObserver_COLNAME by hand, because we need to pass the index var inside the observe function deifnition.
  eval("miczColumnsWizard.CustCols.CreateDbObserver_"+index+"={observe: function(aMsgFolder, aTopic, aData){miczColumnsWizard.CustCols.addCustomColumnHandler('"+index+"');}};");
}
//Create all the needed DbObserver - END

//Implement the ColumnHandlers
//cc
miczColumnsWizard.CustCols["columnHandler_cc"]={
   getCellText:         function(row, col) {
      //get the message's header so that we can extract the cc to field
      let hdr = gDBView.getMsgHdrAt(row);
      //dump(">>>>>>>>>>>>> miczColumnsWizard->columnHandler_cc: [value] "+hdr.getStringProperty("ccList")+"\r\n");
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

//bcc
miczColumnsWizard.CustCols["columnHandler_bcc"]={
   getCellText:         function(row, col) {
      //get the message's header so that we can extract the bcc to field
      let hdr = gDBView.getMsgHdrAt(row);
      //dump(">>>>>>>>>>>>> miczColumnsWizard->columnHandler_bcc: [value] "+hdr.getStringProperty("bccList")+"\r\n");
      return hdr.getStringProperty("bccList");
   },
   getSortStringForRow: function(hdr) {return hdr.getStringProperty("bccList");},
   isString:            function() {return true;},
   getCellProperties:   function(row, col, props){},
   getRowProperties:    function(row, props){},
   getImageSrc:         function(row, col) {return null;},
   getSortLongForRow:   function(hdr) {return 0;}
};
//bcc - END

//replyto
miczColumnsWizard.CustCols["columnHandler_replyto"]={
   getCellText:         function(row, col) {
      //get the message's header so that we can extract the replyTo to field
      let hdr = gDBView.getMsgHdrAt(row);
      //dump(">>>>>>>>>>>>> miczColumnsWizard->columnHandler_bcc: [value] "+hdr.getStringProperty("replyTo")+"\r\n");
      return hdr.getStringProperty("replyTo");
   },
   getSortStringForRow: function(hdr) {return hdr.getStringProperty("replyTo");},
   isString:            function() {return true;},
   getCellProperties:   function(row, col, props){},
   getRowProperties:    function(row, props){},
   getImageSrc:         function(row, col) {return null;},
   getSortLongForRow:   function(hdr) {return 0;}
};
//replyto - END

//xoriginalfrom
miczColumnsWizard.CustCols["columnHandler_xoriginalfrom"]={
   getCellText:         function(row, col) {
      //get the message's header so that we can extract the x-original-from to field
      let hdr = gDBView.getMsgHdrAt(row);
      //dump(">>>>>>>>>>>>> miczColumnsWizard->columnHandler_x-original-from: [value] "+hdr.getStringProperty("x-original-from")+"\r\n");
      return hdr.getStringProperty("x-original-from");
   },
   getSortStringForRow: function(hdr) {return hdr.getStringProperty("x-original-from");},
   isString:            function() {return true;},
   getCellProperties:   function(row, col, props){},
   getRowProperties:    function(row, props){},
   getImageSrc:         function(row, col) {return null;},
   getSortLongForRow:   function(hdr) {return 0;}
};
//xoriginalfrom - END

//contentbase
miczColumnsWizard.CustCols["columnHandler_contentbase"]={
   getCellText:         function(row, col) {
      //get the message's header so that we can extract the content-base to field
      let hdr = gDBView.getMsgHdrAt(row);
      //dump(">>>>>>>>>>>>> miczColumnsWizard->columnHandler_content-base: [value] "+hdr.getStringProperty("content-base")+"\r\n");
      return hdr.getStringProperty("content-base");
   },
   getSortStringForRow: function(hdr) {return hdr.getStringProperty("content-base");},
   isString:            function() {return true;},
   getCellProperties:   function(row, col, props){},
   getRowProperties:    function(row, props){},
   getImageSrc:         function(row, col) {return null;},
   getSortLongForRow:   function(hdr) {return 0;}
};
//contentbase - END
