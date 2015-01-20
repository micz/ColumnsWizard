"use strict";
Components.utils.import("chrome://columnswizard/content/mzcw-customcolsgrid.jsm");

var miczColumnsWizard={};
var miczColumnsWizardPref = {

	onLoad: function(win){
		this.loadCustColRows(win);
	},

	loadCustColRows:function(win){
		let doc = win.document;
		let container = doc.getElementById('ColumnsWizard.CustColsList');
		miczColumnsWizardPref_CustomColsGrid.createCustomColsListRows(doc,container,miczColumnsWizard.CustCols.loadCustCols());
	},

	updateButtons: function(win){
		let doc = win.document;
		let currlist=doc.getElementById('ColumnsWizard.CustColsList');
		let numSelected = currlist.selectedItems.length;
		let oneSelected = (numSelected == 1);
		if(oneSelected){
			//if it's a bundled item, we can not modify or delete it!
			let currcol=miczColumnsWizardPref_CustomColsGrid.currentCustomCol(currlist);
			let btnDisabled = currcol.isBundled;
			//dump(">>>>>>>>>>>>> miczColumnsWizard: [updateButtons] currlist.selectedItem "+JSON.stringify(currcol)+"\r\n");
			//dump(">>>>>>>>>>>>> miczColumnsWizard: [updateButtons] col_index {"+currcol.index+"}\r\n");
			//dump(">>>>>>>>>>>>> miczColumnsWizard: [updateButtons] btnDisabled {"+btnDisabled+"}\r\n");
			doc.getElementById("editButton").disabled=btnDisabled;
			doc.getElementById("deleteButton").disabled=btnDisabled;
		}
		dump(">>>>>>>>>>>>> miczColumnsWizard: [updateButtons] currlist num selected {"+numSelected+"}\r\n");
	},

};
