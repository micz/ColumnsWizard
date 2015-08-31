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

	if((elementc.labelImagePath)&&(elementc.labelImagePath!="")){	//we have an image to use!!
		let file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(elementc.labelImagePath)
		if((file)&&(file.exists())){
			cwCol.setAttribute("src","file://"+elementc.labelImagePath);
			cwCol.setAttribute("class", "treecol-image cw_col_image");
		}
	}

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
	//dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizard_CustCols] CustColIndex: "+JSON.stringify(CustColIndex)+"\r\n");
    miczColumnsWizard_CustCols.checkDefaultCustomColumnPrefs();
    for (let singlecolidx in CustColIndex) {
		//dump(">>>>>>>>>>>>> miczColumnsWizard->loadCustCols: [CustColIndex[singlecolidx]] "+CustColIndex[singlecolidx]+"\r\n");
		try{
			loadedCustColPref[CustColIndex[singlecolidx]]=JSON.parse(prefs_def.getCharPref(CustColIndex[singlecolidx]));
			if(loadedCustColPref[CustColIndex[singlecolidx]].isSearchable===undefined){
				loadedCustColPref[CustColIndex[singlecolidx]].isSearchable=false;
			}
		}catch(ex){
			//We have an index, but no preference for it, so we remove it...
			miczColumnsWizard_CustCols.removeCustColIndex(CustColIndex[singlecolidx]);
		}
	}
	//dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizard_CustCols] loadedCustColPref: "+JSON.stringify(loadedCustColPref)+"\r\n");
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
						dcurrcol.sortnumber=false;
						dcurrcol.isCustom=false;
						dcurrcol.isSearchable=false;
						break;
					case 'bcc':
						dcurrcol.enabled = prefs.getBoolPref("Addbcc");
						dcurrcol.def = "Addbcc";
						dcurrcol.dbHeader = "bccList";
						dcurrcol.sortnumber=false;
						dcurrcol.isCustom=false;
						dcurrcol.isSearchable=false;
						break;
					case 'replyto':
						dcurrcol.enabled = prefs.getBoolPref("Addreplyto");
						dcurrcol.def = "Addreplyto";
						dcurrcol.dbHeader = "replyTo";
						dcurrcol.sortnumber=false;
						dcurrcol.isCustom=false;
						dcurrcol.isSearchable=true;
						break;
					case 'xoriginalfrom':
						dcurrcol.enabled = prefs.getBoolPref("Addxoriginalfrom");
						dcurrcol.def = "Addxoriginalfrom";
						dcurrcol.dbHeader = "x-original-from";
						dcurrcol.sortnumber=false;
						dcurrcol.isCustom=true;
						dcurrcol.isSearchable=true;
						break;
					case 'contentbase':
						dcurrcol.enabled = prefs.getBoolPref("Addcontentbase");
						dcurrcol.def = "Addcontentbase";
						dcurrcol.dbHeader = "content-base";
						dcurrcol.sortnumber=false;
						dcurrcol.isCustom=true;
						dcurrcol.isSearchable=true;
						break;
					case 'xspamscore':
						dcurrcol.enabled = false;
						dcurrcol.def = "";
						dcurrcol.dbHeader = "x-spam-score";
						dcurrcol.sortnumber=true;
						dcurrcol.isCustom=true;
						dcurrcol.isSearchable=true;
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
		if(CustColIndex.indexOf(index)==-1){
			CustColIndex.push(index);
		}
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
		if(el_idx>-1){
			CustColIndex.splice(el_idx,1);
		}
		prefs.setCharPref("index",JSON.stringify(CustColIndex));
		//remove it also from index_mod
		miczColumnsWizard_CustCols.removeCustColIndexMod(index);
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

		//Adding the cust col as searchable
		if(currcol.isSearchable){
			miczColumnsWizard_CustCols.activateCustomHeaderSearchable(currcol.dbHeader);
		}else{
			miczColumnsWizard_CustCols.deactivateCustomHeaderSearchable(currcol.dbHeader);
		}
		
		//mod index
		if(currcol.isEditable){
			miczColumnsWizard_CustCols.addCustColIndexMod(currcol.index);
		}else{
			miczColumnsWizard_CustCols.removeCustColIndexMod(currcol.index);
		}
		
		//update header editing menu
		let ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		ObserverService.notifyObservers(null,"CW-updateHeaderEditingMenu",null);

    	return value;
	},

	deleteCustCol: function(col_idx){
		miczColumnsWizard_CustCols.removeCustColIndex(col_idx);
		//update header editing menu
		let ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		ObserverService.notifyObservers(null,"CW-updateHeaderEditingMenu",null);
	},

	activateCustomHeaderSearchable:function(newHeader){
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [CustomHeaderSearchable] "+newHeader+"\r\n");
		let prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		let currentHeaders = prefService.getCharPref("mailnews.customHeaders");
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [CustomHeaderSearchable]: currentHeaders: "+currentHeaders+"\r\n");
		let headers_array=new Array();
		if(currentHeaders!=''){
			headers_array=currentHeaders.split(': ');
		}
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [CustomHeaderSearchable]: headers_array: "+JSON.stringify(headers_array)+"\r\n");
		if(headers_array.indexOf(newHeader)==-1){
			headers_array.push(newHeader);
			currentHeaders=headers_array.join(': ');
			prefService.setCharPref("mailnews.customHeaders", currentHeaders.trim());
			//dump(">>>>>>>>>>>>> miczColumnsWizard: [CustomHeaderSearchable->Updating] "+newHeader+"\r\n");
		}
	},

	deactivateCustomHeaderSearchable:function(newHeader){
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [deactivate CustomHeaderSearchable] "+newHeader+"\r\n");
		let prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		let currentHeaders = prefService.getCharPref("mailnews.customHeaders");
		let headers_array=currentHeaders.split(': ');
		let h_idx=headers_array.indexOf(newHeader);
		if(h_idx>-1){
			headers_array.splice(h_idx,1);
			currentHeaders=headers_array.join(': ');
			prefService.setCharPref("mailnews.customHeaders", currentHeaders.trim());
			//dump(">>>>>>>>>>>>> miczColumnsWizard: [deactivate CustomHeaderSearchable->Updating] "+newHeader+"\r\n");
		}
	},

	addCustColIndexMod:function(index){
		let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		let prefs = prefsc.getBranch("extensions.ColumnsWizard.CustCols.");
		let CustColIndexStr='';
		try{
			CustColIndexStr=prefs.getCharPref("index_mod");
		}
		catch(e){}
		let CustColIndex=new Array();
		if(CustColIndexStr!=''){
			CustColIndex=JSON.parse(CustColIndexStr);
		}
		//Add new element to index and save it
		if(CustColIndex.indexOf(index)==-1){
			CustColIndex.push(index);
		}
		CustColIndex.sort();
		prefs.setCharPref("index_mod",JSON.stringify(CustColIndex));
		prefs.setBoolPref("mod_active",true);
	},

	removeCustColIndexMod:function(index){
		let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		let prefs = prefsc.getBranch("extensions.ColumnsWizard.CustCols.");
		let CustColIndexStr=prefs.getCharPref("index_mod");
		let CustColIndex=new Array();
		if(CustColIndexStr==''){
			return;
		}else{
			CustColIndex=JSON.parse(CustColIndexStr);
		}
		//Remove the element to index and save it
		let el_idx=CustColIndex.indexOf(index);
		if(el_idx>-1){
			CustColIndex.splice(el_idx,1);
		}
		CustColIndexStr=JSON.stringify(CustColIndex).trim();
		prefs.setCharPref("index_mod",CustColIndexStr);
		if(CustColIndex.length==0){ //no mod cust cols? set the option to false
			prefs.setBoolPref("mod_active",false);
		}
	},

};
