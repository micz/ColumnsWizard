"use strict";
var miczColumnsWizard={};
var miczColumnsWizardPref = {

	onLoad: function(win){
		this.createColsGridHeader(win);
		this.loadCustColRows(win);
	},
	
	createColsGridHeader: function(win) {
		const XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
		let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
		let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/overlay.properties");
		try {
			let doc = win.document;
			let container = doc.getElementById('ColumnsWizard.ColsGrid');
			if ( !container ) return;
			while (container.firstChild) container.removeChild(container.firstChild);
			let row = doc.createElementNS(XUL, "row");
			["A", "S", "mail_header", "column_title", "tooltip", "save", "delete"].forEach( function(label) {
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
			row.id = "ColumnsWizard.ColsGrid-header";
			container.insertBefore(row, null);
		}catch(err) {
		  dump(">>>>>>>>>>>>> miczColumnsWizard: [settings createColsGridHeader] "+err+"\r\n");
		}
	},
	
	createOneColRow:function(win,custcol){
		const XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
		let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
		let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/overlay.properties");
		try {
		  let doc = win.document;
		  let container = doc.getElementById('ColumnsWizard.ColsGrid');
		  if ( !container ) return;
		  let row = doc.createElementNS(XUL, "row");

		  let col_enable = doc.createElementNS(XUL, "checkbox");
		  col_enable.setAttribute("checked", custcol.Enabled);
		  //col_enable.setAttribute("rule", 'col_enable');
		  
		  let col_show = doc.createElementNS(XUL, "checkbox");
		  col_show.setAttribute("checked", custcol.ShowNewFolder);
		  //col_show.setAttribute("rule", 'col_show');
		  
		let labelString = '';
		let tooltipString = '';
		if(custcol.isbundled){
			labelString = _bundleCW.GetStringFromName("ColumnsWizard"+custcol.index+".label");
			tooltipString = _bundleCW.GetStringFromName("ColumnsWizard"+custcol.index+"Desc.label");
		}else{
			labelString = custcol.labelString;
			tooltipString = custcol.tooltipString;
		}
		  
		  let [mail_header, column_title, column_tooltip] = [
			// value, size          
			[custcol.DBHeader, "10"],
			[labelString, "10"],
			[tooltipString, "10"]].map( function(attributes) {
			  let element = doc.createElementNS(XUL, "textbox");
			  let [value,size] = attributes;
			  if ( size ) element.setAttribute("size", size);
			  element.setAttribute("value", value);
			  return element;
			} );
		  //TODO: FROM HERE
		  /*let [col_save,col_delete] = [
			['\u2191', function(aEvent) { self.upDownRule(row, true); }, ''],
			['\u2193', function(aEvent) { self.upDownRule(row, false); }, ''],
			['x', function(aEvent) { self.removeRule(row); }, 'awsome_auto_archive-delete-rule'] ].map( function(attributes) {
			  let element = doc.createElementNS(XUL, "toolbarbutton");
			  element.setAttribute("label", attributes[0]);
			  element.addEventListener("command", attributes[1], false );
			  if (attributes[2]) element.classList.add(attributes[2]);
			  return element;
			} );
		  
		  row.classList.add(ruleClass);
		  [enable, menulistAction, menulistSrc, menulistSub, menulistDest, from, recipient, subject, size, tags, age, up, down, remove].forEach( function(item) {
			row.insertBefore(item, null);
		  } );
		  container.insertBefore(row, ref);
		  self.initFolderPick(menulistSrc, menupopupSrc, true);
		  self.initFolderPick(menulistDest, menupopupDest, false);
		  self.checkAction(menulistAction, menulistDest, menulistSub);
		  self.checkEnable(enable, row);
		  menulistAction.addEventListener('command', function(aEvent) { self.checkAction(menulistAction, menulistDest, menulistSub); }, false );
		  enable.addEventListener('command', function(aEvent) { self.checkEnable(enable, row); }, false );
		  row.addEventListener('focus', function(aEvent) { self.checkFocus(row); }, true );
		  row.addEventListener('click', function(aEvent) { self.checkFocus(row); }, true );*/
		  return row;
		} catch(err) {
		  dump(">>>>>>>>>>>>> miczColumnsWizard: [settings createOneColRow] "+err+"\r\n");
		}
	},
	
	loadCustColRows:function(win){
		let miczColumnsWizard_CustColPref=miczColumnsWizard.CustCols.loadCustCols();
		for (let index in miczColumnsWizard_CustColPref) {
				this.createOneColRow(win,miczColumnsWizard_CustColPref[index]);
		}
	},

};
