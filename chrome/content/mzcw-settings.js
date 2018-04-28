"use strict";
Components.utils.import("chrome://columnswizard/content/mzcw-customcolsgrid.jsm");
Components.utils.import("chrome://columnswizard/content/mzcw-defaultcolsgrid.jsm");
Components.utils.importGlobalProperties(["XMLHttpRequest"]);

var miczColumnsWizard=window.opener.miczColumnsWizard;
var miczColumnsWizardPref = {

	onLoad: function(win){
		this.loadCustColRows(win);

		//Load release notes
		this.loadInfoFile('release_notes');

		//Fixing window height
		sizeToContent();
		var vbox = document.getElementById('cw_tabbox');
		vbox.height = vbox.boxObject.height;
		sizeToContent();

		this.loadDefaultColRows(win);

		miczColumnsWizardPref_CustomColsGrid.miczColumnsWizard_CustCols=miczColumnsWizard_CustCols;
		miczColumnsWizardPref_CustomColsGrid.win=win;
		miczColumnsWizardPref_CustomColsGrid.onEditCustomCol=miczColumnsWizardPref.onEditCustomCol;
	},

	loadDefaultColRows:function(win){
		let doc = win.document;
		let container = doc.getElementById('ColumnsWizard.DefaultColsGrid');
		miczColumnsWizardPref_DefaultColsGrid.loadedCustCols=miczColumnsWizard_CustCols.loadCustCols();
		miczColumnsWizardPref_DefaultColsGrid.createDefaultColsGridHeader(doc,container);
		miczColumnsWizardPref_DefaultColsGrid.createDefaultColsGridRows(doc,container);
	},

	saveDefaultColRows:function(win){
		let doc = win.document;
		let container = doc.getElementById('ColumnsWizard.DefaultColsGrid');
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref] saveDefaultColRows called\r\n");
		return miczColumnsWizardPref_DefaultColsGrid.saveDefaultColsGridRows(doc,container,false);
	},

	loadCustColRows:function(win){
		let doc = win.document;
		let container = doc.getElementById('ColumnsWizard.CustColsList');
		miczColumnsWizardPref_CustomColsGrid.createCustomColsListRows(doc,container,miczColumnsWizard_CustCols.loadCustCols());
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
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [updateButtons] currlist num selected {"+numSelected+"}\r\n");
	},

	onNewCustomCol: function(win){
		let doc = win.document;
		let container = doc.getElementById('ColumnsWizard.CustColsList');
		let args = {"action":"new"};

		window.openDialog("chrome://columnswizard/content/mzcw-settings-customcolseditor.xul", "CustColsEditor", "chrome,modal,titlebar,resizable,centerscreen", args);

		if (("save" in args && args.save)&& ("newcol" in args && args.newcol)){
			miczColumnsWizard_CustCols.addNewCustCol(args.newcol);
			miczColumnsWizardPref_CustomColsGrid.createOneCustomColRow(doc,container,args.newcol);
			// Select the new custcols, it is at the end of the list.
			container.selectedIndex=container.itemCount-1;
			container.ensureIndexIsVisible(container.selectedIndex);
		}

	},

	onEditCustomCol: function(win){
		let doc = win.document;
		let container = doc.getElementById('ColumnsWizard.CustColsList');

		if(container.selectedIndex==-1) return;
		if(doc.getElementById("editButton").disabled) return;

		let args = {"action":"edit","currcol":JSON.stringify(container.selectedItem._customcol)};

		window.openDialog("chrome://columnswizard/content/mzcw-settings-customcolseditor.xul", "CustColsEditor", "chrome,modal,titlebar,resizable,centerscreen", args);

		if (("save" in args && args.save)&& ("newcol" in args && args.newcol)){
			//save the cust col in the pref
			miczColumnsWizard_CustCols.updateCustCol(args.newcol);
			//update the cust col in the listbox
			miczColumnsWizardPref_CustomColsGrid.editOneCustomColRow(doc,container,args.newcol,container.selectedIndex);
			// Select the editedcustcols
			container.ensureIndexIsVisible(container.selectedIndex);
		}

	},

	onDeleteCustomCol: function(win){
		let doc = win.document;
		let container = doc.getElementById('ColumnsWizard.CustColsList');

		if(container.selectedIndex==-1) return;
		if(doc.getElementById("deleteButton").disabled) return;

		//Are you sure?
		let prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		let strBundleCW = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
		let _bundleCW = strBundleCW.createBundle("chrome://columnswizard/locale/settings.properties");

		if(!prompts.confirm(null,_bundleCW.GetStringFromName("ColumnsWizard.deletePrompt.title"),_bundleCW.GetStringFromName("ColumnsWizard.deletePrompt.text"))) return;

		//get the col id
		let col_idx=container.selectedItem._customcol.index;
		//dump(">>>>>>>>>>>>> miczColumnsWizard: [onDeleteCustomCol] col_idx ["+col_idx+"]\r\n");

		//delete the custom col
		let ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		//miczColumnsWizard_CustCols.removeCustomColumn(col_idx,ObserverService)
		//miczColumnsWizard_CustCols.deleteCustCol(col_idx);
		ObserverService.notifyObservers(null,"CW-deleteCustomColumn",col_idx);

		//remove the custom col from the listbox
		miczColumnsWizardPref_CustomColsGrid.deleteOneCustomColRow(container,container.selectedIndex);
	},

	loadInfoFile:function(filetype){
		let url = '';
		switch(filetype){
			case 'release_notes':
				url ="chrome://cwrl/content/release_notes.txt";
				break;
			case 'license':
				url ="chrome://cwrl/content/license.txt";
				break;
		 }
		let request = new XMLHttpRequest();
		request.responseType="text";
		request.addEventListener("load", function() {
			let relnotes = document.getElementById('mzcw-release-notes');
			relnotes.value= this.responseText;
		});
		request.open("GET", url);
		request.send();
	},
};
