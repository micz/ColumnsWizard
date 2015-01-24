"use strict";
//var EXPORTED_SYMBOLS = ["miczColumnsWizard_CustCols"];

var miczColumnsWizard_CustCols={

  //Bundled Custom Columns
  CustColDefaultIndex:["cc","bcc","replyto","xoriginalfrom","contentbase","xspamscore"],
  CreateDbObserver:new Array(),

  addCustomColumnHandler: function(coltype){
	if(gDBView!=null){
    	gDBView.addColumnHandler(coltype+"Col_cw", miczColumnsWizard_CustCols["columnHandler_"+coltype]);
 	}
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
    miczColumnsWizard_CustCols.addCustomColumnHandler(coltype);
   	ObserverService.addObserver(miczColumnsWizard_CustCols.CreateDbObserver[coltype], "MsgCreateDBView", false);
  },

  updateCustomColumn: function(elementc){
    let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
    let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/overlay.properties");

	let coltype=elementc.index;
	let cwCol=document.getElementById(coltype+"Col_cw")

    if(!cwCol){
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
    cwCol.setAttribute("label",labelString);
    cwCol.setAttribute("tooltiptext",tooltipString);
  },

    removeCustomColumn: function(coltype,ObserverService){
      let element = document.getElementById(coltype+"Col_cw");
      if(element) element.parentNode.removeChild(element);

      //dump(">>>>>>>>>>>>> miczColumnsWizard->removeCustomColumn: [coltype] "+coltype+"\r\n");
      //DbObserver Managing
      try{
      	ObserverService.removeObserver(miczColumnsWizard_CustCols.CreateDbObserver[coltype], "MsgCreateDBView");
      }catch(ex){
		//No observer found
	  }
    },

   loadCustCols:function(){
    let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    let prefs = prefsc.getBranch("extensions.ColumnsWizard.CustCols.");
    let prefs_def = prefsc.getBranch("extensions.ColumnsWizard.CustCols.def.");
    let CustColIndexStr=prefs.getCharPref("index");
    let CustColIndex=new Array();
    if(CustColIndexStr==''){
		//Set default CustColIndex
		CustColIndex=miczColumnsWizard_CustCols.CustColDefaultIndex;
		prefs.setCharPref("index",JSON.stringify(CustColIndex));
	}else{
		CustColIndex=miczColumnsWizard_CustCols.checkCustColDefaultIndex(JSON.parse(CustColIndexStr));
	}
    let loadedCustColPref=new Array();
    miczColumnsWizard_CustCols.checkDefaultCustomColumnPrefs();
    for (let singlecolidx in CustColIndex) {
		//dump(">>>>>>>>>>>>> miczColumnsWizard->loadCustCols: [CustColIndex[singlecolidx]] "+CustColIndex[singlecolidx]+"\r\n");
		try{
			loadedCustColPref[CustColIndex[singlecolidx]]=JSON.parse(prefs_def.getCharPref(CustColIndex[singlecolidx]));
		}catch(ex){
			//We have and index, but no preference for it, so we remove it...
			miczColumnsWizard_CustCols.removeCustColIndex(CustColIndex[singlecolidx]);
		}
	}
    return loadedCustColPref;
  },

  checkCustColDefaultIndex:function(curr_idx){
		for (let idx in miczColumnsWizard_CustCols.CustColDefaultIndex){
			if(curr_idx.indexOf(miczColumnsWizard_CustCols.CustColDefaultIndex[idx])==-1){
				curr_idx.push(miczColumnsWizard_CustCols.CustColDefaultIndex[idx]);
			}
		}
		//dump(">>>>>>>>>>>>> miczColumnsWizard->checkCustColDefaultIndex: curr_idx "+JSON.stringify(curr_idx)+"\r\n");
		return curr_idx;
  },

  checkDefaultCustomColumnPrefs: function(){
		let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		let prefs = prefsc.getBranch("extensions.ColumnsWizard.CustCols.");
		let prefs_def = prefsc.getBranch("extensions.ColumnsWizard.CustCols.def.");

		for (let singlecolidx in miczColumnsWizard_CustCols.CustColDefaultIndex) {
			//dump(">>>>>>>>>>>>> miczColumnsWizard: [checkDefaultCustomColumnPrefs singlecolidx] "+miczColumnsWizard_CustCols.CustColDefaultIndex[singlecolidx]+" \r\n");
			let currcol=prefs_def.getCharPref(miczColumnsWizard_CustCols.CustColDefaultIndex[singlecolidx]);
			if(currcol==''){//Default custom column pref not present
				let dcurrcol={}
				switch(miczColumnsWizard_CustCols.CustColDefaultIndex[singlecolidx]){
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
					case 'xspamscore':
						dcurrcol.enabled = false;
						dcurrcol.def = "";
						dcurrcol.dbHeader = "x-spam-score";
						dcurrcol.isCustom=true;
						break;
				}
				dcurrcol.index=miczColumnsWizard_CustCols.CustColDefaultIndex[singlecolidx];
				dcurrcol.isBundled=true;
				dcurrcol.labelString='';
				dcurrcol.tooltipString='';
				prefs_def.setCharPref(miczColumnsWizard_CustCols.CustColDefaultIndex[singlecolidx],JSON.stringify(dcurrcol));
			}
		}
	},

	addNewCustCol:function(newcol){
		let ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		miczColumnsWizard_CustCols.addCustColIndex(newcol.index);
		ObserverService.notifyObservers(null,"CW-newCustomColumn",JSON.stringify(newcol));
		miczColumnsWizard_CustCols.saveCustCol(newcol);
	},

	updateCustCol:function(newcol){
		let ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		ObserverService.notifyObservers(null,"CW-updateCustomColumn",JSON.stringify(newcol));
		miczColumnsWizard_CustCols.saveCustCol(newcol);
	},

	addCustColIndex:function(index){
		let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		let prefs = prefsc.getBranch("extensions.ColumnsWizard.CustCols.");
		let CustColIndexStr=prefs.getCharPref("index");
		let CustColIndex=new Array();
		if(CustColIndexStr==''){
			//Set default CustColIndex
			CustColIndex=miczColumnsWizard_CustCols.CustColDefaultIndex;
			prefs.setCharPref("index",JSON.stringify(CustColIndex));
		}else{
			CustColIndex=miczColumnsWizard_CustCols.checkCustColDefaultIndex(JSON.parse(CustColIndexStr));
		}
		//Add new element to index and save it
		CustColIndex.push(index);
		prefs.setCharPref("index",JSON.stringify(CustColIndex));
	},

	removeCustColIndex:function(index){
		let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		let prefs = prefsc.getBranch("extensions.ColumnsWizard.CustCols.");
		let CustColIndexStr=prefs.getCharPref("index");
		let CustColIndex=new Array();
		if(CustColIndexStr==''){
			return;
		}else{
			CustColIndex=JSON.parse(CustColIndexStr);
		}
		//Remove the element to index and save it
		let el_idx=CustColIndex.indexOf(index);
		CustColIndex.splice(el_idx,1);
		prefs.setCharPref("index",JSON.stringify(CustColIndex));
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

	deleteCustCol: function(col_idx){
		miczColumnsWizard_CustCols.removeCustColIndex(col_idx);
	},
};
