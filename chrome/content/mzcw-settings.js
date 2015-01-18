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

};
