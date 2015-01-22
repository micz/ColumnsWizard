"use strict";
var EXPORTED_SYMBOLS = ["miczColumnsWizard_CustCols"];

var miczColumnsWizard_CustCols={

  //Bundled Custom Columns
  CustColDefaultIndex:["cc","bcc","replyto","xoriginalfrom","contentbase"],
  CreateDbObserver:{},

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
    if(elementc.isBundled){
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
    ObserverService.addObserver(this.CreateDbObserver[coltype], "MsgCreateDBView", false);
  },

    removeCustomColumn: function(coltype,ObserverService){
      let element = document.getElementById(coltype+"Col_cw");
      if(element) element.parentNode.removeChild(element);

      //dump(">>>>>>>>>>>>> miczColumnsWizard->removeCustomColumn: [coltype] "+coltype+"\r\n");
      //DbObserver Managing
      ObserverService.removeObserver(this.CreateDbObserver[coltype], "MsgCreateDBView");
    },

   loadCustCols:function(){
    let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    let prefs = prefsc.getBranch("extensions.ColumnsWizard.CustCols.");
    let prefs_def = prefsc.getBranch("extensions.ColumnsWizard.CustCols.def.");
    let CustColIndexStr=prefs.getCharPref("index");
    let CustColIndex=new Array();
    if(CustColIndexStr==''){
		//Set default CustColIndex
		CustColIndex=this.CustColDefaultIndex;
		prefs.setCharPref("index",JSON.stringify(CustColIndex));
	}else{
		CustColIndex=JSON.parse(CustColIndexStr);
	}
    let loadedCustColPref=new Array();
    this.checkDefaultCustomColumnPrefs();
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

		for (let singlecolidx in this.CustColDefaultIndex) {
			//dump(">>>>>>>>>>>>> miczColumnsWizard: [checkDefaultCustomColumnPrefs singlecolidx] "+miczColumnsWizard_CustCols.CustColDefaultIndex[singlecolidx]+" \r\n");
			let currcol=prefs_def.getCharPref(this.CustColDefaultIndex[singlecolidx]);
			if(currcol==''){//Default custom column pref not present
				let dcurrcol={}
				switch(this.CustColDefaultIndex[singlecolidx]){
					case 'cc':
						dcurrcol.enabled = prefs.getBoolPref("AddCc");
						dcurrcol.def = "AddCc";
						dcurrcol.dbHeader = "ccList";
						dcurrcol.isCustom=false;
						break;
					case 'bcc':
						dcurrcol.enabled = prefs.getBoolPref("Addbcc");
						dcurrcol.def = "Addbcc";
						dcurrcol.dbHeader = "bccList";
						dcurrcol.isCustom=false;
						break;
					case 'replyto':
						dcurrcol.enabled = prefs.getBoolPref("Addreplyto");
						dcurrcol.def = "Addreplyto";
						dcurrcol.dbHeader = "replyTo";
						dcurrcol.isCustom=false;
						break;
					case 'xoriginalfrom':
						dcurrcol.enabled = prefs.getBoolPref("Addxoriginalfrom");
						dcurrcol.def = "Addxoriginalfrom";
						dcurrcol.dbHeader = "x-original-from";
						dcurrcol.isCustom=true;
						break;
					case 'contentbase':
						dcurrcol.enabled = prefs.getBoolPref("Addcontentbase");
						dcurrcol.def = "Addcontentbase";
						dcurrcol.dbHeader = "content-base";
						dcurrcol.isCustom=true;
						break;
				}
				dcurrcol.index=this.CustColDefaultIndex[singlecolidx];
				dcurrcol.isBundled=true;
				dcurrcol.labelString='';
				dcurrcol.tooltipString='';
				prefs_def.setCharPref(this.CustColDefaultIndex[singlecolidx],JSON.stringify(dcurrcol));
			}
		}
	},

	saveNewCustCol:function(newcol){
		let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		let prefs = prefsc.getBranch("extensions.ColumnsWizard.CustCols.");
		let prefs_def = prefsc.getBranch("extensions.ColumnsWizard.CustCols.def.");
		let CustColIndexStr=prefs.getCharPref("index");
		let CustColIndex=new Array();
		if(CustColIndexStr==''){
			//Set default CustColIndex
			CustColIndex=this.CustColDefaultIndex;
			prefs.setCharPref("index",JSON.stringify(CustColIndex));
		}else{
			CustColIndex=JSON.parse(CustColIndexStr);
		}
		//Add new element to index and save it
		CustColIndex.push(newcol.index);
		prefs.setCharPref("index",JSON.stringify(CustColIndex));

		//Save the new element
		this.saveCustCol(newcol);
	},

	saveCustCol: function(currcol) {
		let value = JSON.stringify(currcol);
		let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		//Saving custom columns item to prefs
		let prefs_def = prefsc.getBranch("extensions.ColumnsWizard.CustCols.def.");
		prefs_def.setCharPref(currcol.index,value);

		//Saving enabled status to prefs (for bundled custom columns)
		if((currcol.isBundled)&&(currcol.def !== undefined)&&(currcol.def != "")){
			let prefs=prefsc.getBranch("extensions.ColumnsWizard.CustCols.");
			prefs.setBoolPref(currcol.def,currcol.enabled);
		}

    	return value;
	},
};

/*
miczColumnsWizard.CustColPref=miczColumnsWizard_CustCols.loadCustCols();
miczColumnsWizard_CustCols.CreateDbObserver=Array();
for (let index in miczColumnsWizard.CustColPref) {
  //Create all the needed DbObservers
  //dump(">>>>>>>>>>>>> miczColumnsWizard->CreateDbObserver: [index] "+index+"\r\n");
  //It's needed to to this, to avoid writing each miczColumnsWizard_CustCols.CreateDbObserver_COLNAME by hand, because we need to pass the index var inside the observe function definition.
  let obfunction=new Function('aMsgFolder', 'aTopic', 'aData',"miczColumnsWizard_CustCols.addCustomColumnHandler('"+index+"');");
  miczColumnsWizard_CustCols.CreateDbObserver[index]={observe: obfunction};
  //Create all the needed DbObserver - END

 //Implement all the needed ColumnHandlers
 let sortfunc=new Function('hdr','return hdr.getStringProperty("'+miczColumnsWizard.CustColPref[index].dbHeader+'");');
 let celltextfunc=new Function('row','col','let hdr = gDBView.getMsgHdrAt(row);return hdr.getStringProperty("'+miczColumnsWizard.CustColPref[index].dbHeader+'");');

  miczColumnsWizard_CustCols["columnHandler_"+index]={
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
miczColumnsWizard_CustCols["columnHandler_cc"]={
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
miczColumnsWizard_CustCols["columnHandler_bcc"]={
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
miczColumnsWizard_CustCols["columnHandler_replyto"]={
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
miczColumnsWizard_CustCols["columnHandler_xoriginalfrom"]={
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
miczColumnsWizard_CustCols["columnHandler_contentbase"]={
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
