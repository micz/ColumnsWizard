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
		miczColumnsWizardPref_DefaultColsGrid.loadDefaultColRows_Pref();

		/*for (let index in miczColumnsWizard_CustColPref) {
				this.createOneColRow(win,miczColumnsWizard_CustColPref[index]);
		}*/
	},

};
