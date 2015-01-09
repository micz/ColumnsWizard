"use strict";
Components.utils.import("chrome://columnswizard/content/mzcw-defaultcolsgrid.jsm");

var miczColumnsWizard={};
var miczColumnsWizardPref = {

	onLoad: function(win){
		this.loadDefaultColRows(win);
	},

	loadDefaultColRows:function(win){
		let doc = win.document;
		let container = doc.getElementById('ColumnsWizard.DefaultColsGrid');
		miczColumnsWizardPref_DefaultColsGrid.createDefaultColsGridHeader(doc,container);
		miczColumnsWizardPref_DefaultColsGrid.createDefaultColsGridRows(doc,container);
	},

	saveDefaultColRows:function(win){
		let doc = win.document;
		let container = doc.getElementById('ColumnsWizard.DefaultColsGrid');
		dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref] saveDefaultColRows called\r\n");
		return miczColumnsWizardPref_DefaultColsGrid.saveDefaultColsGridRows(doc,container,false);
	},

};
