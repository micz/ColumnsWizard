"use strict";
var miczColumnsWizardPref = {

	onLoad: function(win){
		this.createColsGridHeader(win);
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
			["A", "S", "header", "column_title", "tooltip", "save", "delete",].forEach( function(label) {
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
			  item.setAttribute('rule', label); // header does not have class ruleClass
			}
			row.insertBefore(item, null);
			} );
			row.id = "ColumnsWizard.ColsGrid-header";
			container.insertBefore(row, null);
		}catch(err) {
		  dump(">>>>>>>>>>>>> miczColumnsWizard: [settings createColsGridHeader] "+err+"\r\n");
		}
	},

};
