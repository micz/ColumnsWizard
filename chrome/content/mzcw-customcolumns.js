"use strict";
miczColumnsWizard.CustCols={
	
  //Bundled Custom Columns
  CustColDefaultIndex:["cc","bcc","replyto","xoriginalfrom","contentbase"],

  addCustomColumnHandler: function(coltype) {
     gDBView.addColumnHandler(coltype+"Col_cw", this["columnHandler_"+coltype]);
  },
  
  addCustomColumn: function(elementc,ObserverService){
    let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
    let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/overlay.properties");
	
	let coltype=elementc.index;
	
    if(document.getElementById(coltype+"Col_cw")){
      return;
    }
    
    let labelString = '';
    let tooltipString = '';
    if(elementc.isbundled){
		labelString = _bundleCW.GetStringFromName("ColumnsWizard"+coltype+".label");
		tooltipString = _bundleCW.GetStringFromName("ColumnsWizard"+coltype+"Desc.label");
	}else{
		labelString = elementc.labelString;
		tooltipString = elementc.tooltipString;
	}
    let cwCol = document.createElement("treecol");
    cwCol.setAttribute("id",coltype+"Col_cw");
    cwCol.setAttribute("persist","hidden ordinal width");
    cwCol.setAttribute("hidden","true");
    cwCol.setAttribute("flex","4");
    cwCol.setAttribute("label",labelString);
    cwCol.setAttribute("tooltiptext",tooltipString);
    let cwSplitter = document.createElement("splitter");
    cwSplitter.setAttribute("class","tree-splitter");
    cwSplitter.setAttribute("resizeafter","farthest");
    let element = document.getElementById("threadCols");
    let lastordinal=element.children.length;
    //dump('>>>>>>>>> columns [js children: '+lastordinal+"] [real: "+(lastordinal-1)/2+"]\r\n");
    cwSplitter.setAttribute("ordinal",lastordinal+1);
    element.appendChild(cwSplitter);
    element.appendChild(cwCol);
    
    //dump(">>>>>>>>>>>>> miczColumnsWizard->addCustomColumn: [coltype] "+coltype+"\r\n");
    //DbObserver Managing
    ObserverService.addObserver(miczColumnsWizard.CustCols.CreateDbObserver[coltype], "MsgCreateDBView", false);
  },
  
    removeCustomColumn: function(coltype,ObserverService){
      let element = document.getElementById(coltype+"Col_cw");
      if(element) element.parentNode.removeChild(element);
      
      //dump(">>>>>>>>>>>>> miczColumnsWizard->removeCustomColumn: [coltype] "+coltype+"\r\n");
      //DbObserver Managing
      ObserverService.removeObserver(miczColumnsWizard.CustCols.CreateDbObserver[coltype], "MsgCreateDBView");
    },
    
   loadCustCols:function(){
    let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    let prefs = prefsc.getBranch("extensions.ColumnsWizard.CustCols.");
    let prefs_def = prefsc.getBranch("extensions.ColumnsWizard.CustCols.def.");
    let CustColIndexStr=prefs.getCharPref("index");
    let CustColIndex=new Array();
    if(CustColIndexStr==''){
		//Set default CustColIndex
		CustColIndex=miczColumnsWizard.CustCols.CustColDefaultIndex;
	}else{
		CustColIndex=JSON.parse(CustColIndexStr);
	}
    let loadedCustColPref=new Array();
    miczColumnsWizard.CustCols.checkDefaultCustomColumnPrefs();
    for (let singlecolidx in CustColIndex) {
		loadedCustColPref[CustColIndex[singlecolidx]]=JSON.parse(prefs_def.getCharPref(CustColIndex[singlecolidx]));
	}
    
 
    /*loadedCustColPref["cc"]={};
    loadedCustColPref["cc"].Pref = prefs.getBoolPref("AddCc");
    loadedCustColPref["cc"].Def = "AddCc";
    loadedCustColPref["cc"].customDBHeader = false;
    loadedCustColPref["bcc"]={};
    loadedCustColPref["bcc"].Pref = prefs.getBoolPref("Addbcc");
    loadedCustColPref["bcc"].Def = "Addbcc";
    loadedCustColPref["bcc"].customDBHeader = false;
    loadedCustColPref["replyto"]={};
    loadedCustColPref["replyto"].Pref = prefs.getBoolPref("Addreplyto");
    loadedCustColPref["replyto"].Def = "Addreplyto";
    loadedCustColPref["replyto"].customDBHeader = false;
    loadedCustColPref["xoriginalfrom"]={};
    loadedCustColPref["xoriginalfrom"].Pref = prefs.getBoolPref("Addxoriginalfrom");
    loadedCustColPref["xoriginalfrom"].Def = "Addxoriginalfrom";
    loadedCustColPref["xoriginalfrom"].customDBHeader = "x-original-from";
    loadedCustColPref["contentbase"]={};
    loadedCustColPref["contentbase"].Pref = prefs.getBoolPref("Addcontentbase");
    loadedCustColPref["contentbase"].Def = "Addcontentbase";
    loadedCustColPref["contentbase"].customDBHeader = "content-base";*/
    return loadedCustColPref;
  },
  
  checkDefaultCustomColumnPrefs: function(){
		let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		let prefs = prefsc.getBranch("extensions.ColumnsWizard.CustCols.");
		let prefs_def = prefsc.getBranch("extensions.ColumnsWizard.CustCols.def.");
		
		for (let singlecolidx in miczColumnsWizard.CustCols.CustColDefaultIndex) {
			dump(">>>>>>>>>>>>> miczColumnsWizard: [checkDefaultCustomColumnPrefs singlecolidx] "+miczColumnsWizard.CustCols.CustColDefaultIndex[singlecolidx]+" \r\n");
			let currcol=prefs_def.getCharPref(miczColumnsWizard.CustCols.CustColDefaultIndex[singlecolidx]);
			if(currcol==''){//Default custom column pref not present
				let dcurrcol={}
				switch(miczColumnsWizard.CustCols.CustColDefaultIndex[singlecolidx]){
					case 'cc':
						dcurrcol.Enabled = prefs.getBoolPref("AddCc");
						dcurrcol.ShowNewFolder=false;
						dcurrcol.Def = "AddCc";
						dcurrcol.DBHeader = "ccList";
						dcurrcol.iscustom=false;
						break;
					case 'bcc':
						dcurrcol.Enabled = prefs.getBoolPref("Addbcc");
						dcurrcol.ShowNewFolder=false;
						dcurrcol.Def = "Addbcc";
						dcurrcol.DBHeader = "bccList";
						dcurrcol.iscustom=false;
						break;
					case 'replyto':
						dcurrcol.Enabled = prefs.getBoolPref("Addreplyto");
						dcurrcol.ShowNewFolder=false;
						dcurrcol.Def = "Addreplyto";
						dcurrcol.DBHeader = "replyTo";
						dcurrcol.iscustom=false;
						break;
					case 'xoriginalfrom':
						dcurrcol.Enabled = prefs.getBoolPref("Addxoriginalfrom");
						dcurrcol.ShowNewFolder=false;
						dcurrcol.Def = "Addxoriginalfrom";
						dcurrcol.DBHeader = "x-original-from";
						dcurrcol.iscustom=true;
						break;
					case 'contentbase':
						dcurrcol.Enabled = prefs.getBoolPref("Addcontentbase");
						dcurrcol.ShowNewFolder=false;
						dcurrcol.Def = "Addcontentbase";
						dcurrcol.DBHeader = "content-base";
						dcurrcol.iscustom=true;
						break;
				}
				dcurrcol.index=miczColumnsWizard.CustCols.CustColDefaultIndex[singlecolidx];
				dcurrcol.isbundled=true;
				dcurrcol.labelString='';
				dcurrcol.tooltipString='';
				prefs_def.setCharPref(miczColumnsWizard.CustCols.CustColDefaultIndex[singlecolidx],JSON.stringify(dcurrcol));
			}
		}
	},
};


miczColumnsWizard.CustColPref=miczColumnsWizard.CustCols.loadCustCols();
miczColumnsWizard.CustCols.CreateDbObserver=Array();
for (let index in miczColumnsWizard.CustColPref) {
  //Create all the needed DbObservers
  //dump(">>>>>>>>>>>>> miczColumnsWizard->CreateDbObserver: [index] "+index+"\r\n");
  //It's needed to to this, to avoid writing each miczColumnsWizard.CustCols.CreateDbObserver_COLNAME by hand, because we need to pass the index var inside the observe function definition.
  let obfunction=new Function('aMsgFolder', 'aTopic', 'aData',"miczColumnsWizard.CustCols.addCustomColumnHandler('"+index+"');");
  miczColumnsWizard.CustCols.CreateDbObserver[index]={observe: obfunction};
  //Create all the needed DbObserver - END

 //Implement all the needed ColumnHandlers
 let sortfunc=new Function('hdr','return hdr.getStringProperty("'+miczColumnsWizard.CustColPref[index].DBHeader+'");');
 let celltextfunc=new Function('row','col','let hdr = gDBView.getMsgHdrAt(row);return hdr.getStringProperty("'+miczColumnsWizard.CustColPref[index].DBHeader+'");');
 
  miczColumnsWizard.CustCols["columnHandler_"+index]={
    getCellText:         celltextfunc,
    getSortStringForRow: sortfunc,
    isString:            function() {return true;},
    getCellProperties:   function(row, col, props){},
    getRowProperties:    function(row, props){},
    getImageSrc:         function(row, col) {return null;},
    getSortLongForRow:   function(hdr) {return 0;}
  };
 //Implement all the needed ColumnHandlers - END
}


/*
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
*/
