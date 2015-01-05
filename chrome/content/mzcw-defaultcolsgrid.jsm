"use strict";
var EXPORTED_SYMBOLS = ["miczColumnsWizardPref_DefaultColsGrid"];

var miczColumnsWizardPref_DefaultColsGrid = {

	loadDefaultColRows_Pref:function(){
		let prefsc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		let prefs = prefsc.getBranch("extensions.ColumnsWizard.");
		let DefaultColIndexStr=prefs.getCharPref("DefaultColsList");
		let loadedDefaultColIndex=new Array();
		if(DefaultColIndexStr==''){
			//Set default cols if none set at the moment
			loadedDefaultColIndex=this.getOriginalColIndex();
			dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] default loaded and saved pref\r\n");
			prefs.setCharPref("DefaultColsList",JSON.stringify(loadedDefaultColIndex));
		}else{
			loadedDefaultColIndex=JSON.parse(DefaultColIndexStr);
		}
		dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] "+JSON.stringify(loadedDefaultColIndex)+"\r\n");
		return loadedDefaultColIndex;
	},

	getOriginalColIndex:function(){
		var wMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		var mainWindow = wMediator.getMostRecentWindow("mail:3pane");
		return mainWindow.gFolderDisplay.getColumnStates();
	},

	createDefaultColsGridHeader: function(doc,container) {
		const XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
		let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
		let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/overlay.properties");
		try {
			if ( !container ) return;
			while (container.firstChild) container.removeChild(container.firstChild);
			let row = doc.createElementNS(XUL, "row");
			["A", "col_title", "col_flex", "up", "down"].forEach( function(label) {
			let item;
			if ( label == 'picker' ) {
			  item = doc.createElementNS(XUL, "image");
			  item.classList.add("tree-columnpicker-icon");
			  //item.addEventListener('click', function (event) { return doc.getElementById(ruleHeaderContextMenuID).openPopup(item, 'after_start', 0, 0, true, false, event); }, false );
			  item.setAttribute("tooltiptext", _bundleCW.GetStringFromName("perfdialog.tooltip.picker"));
			} else {
			  item = doc.createElementNS(XUL, "label");
			  //item.setAttribute('value', label ? _bundleCW.GetStringFromName("perfdialog." + label) : "");
			  item.setAttribute('value', label);
			  //item.setAttribute('rule', label); // header does not have class ruleClass
			}
			row.insertBefore(item, null);
			} );
			row.id = container.name+"-header";
			container.insertBefore(row, null);
		}catch(err) {
		  dump(">>>>>>>>>>>>> miczColumnsWizard: [settings createDefaultColsGridHeader] "+err+"\r\n");
		}
	},

	createDefaultColsGridRows: function(doc,container) {
		let DefColRows=this.loadDefaultColRows_Pref();
		for (let index in DefColRows) {
				this.createOneDefaultColRow(doc,container,index,DefColRows[index]);
		}
	},

	saveDefaultColsGridRows: function(doc,container) {
		//TODO
	},

	createOneDefaultColRow:function(doc,container,currindex,currcol){
		const XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
		try {
		  if ( !container ) return;
		  let row = doc.createElementNS(XUL, "row");

		  let col_enable = doc.createElementNS(XUL, "checkbox");
		  col_enable.setAttribute("checked", currcol.visible);

		  let col_title=doc.createElementNS(XUL, "label");
		  col_title.setAttribute("value", currindex);

		  let [col_flex] = [
			// value, size
			[currcol.flex!=undefined?currcol.flex:0, "10"]].map( function(attributes) {
			  let element = doc.createElementNS(XUL, "textbox");
			  let [value,size] = attributes;
			  if ( size ) element.setAttribute("size", size);
			  element.setAttribute("value", value);
			  return element;
			} );

		  let [up, down] = [ //TODO HERE
			['\u2191', function(aEvent) { self.upDownRule(row, true); }, ''],
			['\u2193', function(aEvent) { self.upDownRule(row, false); }, ''] ].map( function(attributes) {
			  let element = doc.createElementNS(XUL, "toolbarbutton");
			  element.setAttribute("label", attributes[0]);
			  element.addEventListener("command", attributes[1], false );
			  if (attributes[2]) element.classList.add(attributes[2]);
			  return element;
			} );

		  //row.classList.add(ruleClass);
		  [col_enable, col_title, col_flex, up, down].forEach( function(item) {
			row.insertBefore(item, null);
		  } );
		  container.insertBefore(row, null);
		  //dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid createOneDefaultColRow] "+currindex+"\r\n");
		  return row;
		} catch(err) {
		  dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid createOneDefaultColRow error] "+err+"\r\n");
		}
	},

};
