"use strict";

var EXPORTED_SYMBOLS = ["miczColumnsWizard_CustomColsModUtils"];

var miczColumnsWizard_CustomColsModUtils = {

	//win:{},

	getFixedListArray:function(textbox_value){
		let fl_string=textbox_value.replace(/(?:\r\n|\r|\n)/g, '|');
		return fl_string.split('|');
	},

	addContextMenu:function(doc,container1,container2,CustCols){
		
		//clear menu items
		while (container1.firstChild) {
			container1.removeChild(container1.firstChild);
		}
		while (container2.firstChild) {
			container2.removeChild(container2.firstChild);
		}
		
		for(let cc in CustCols){
			if(CustCols[cc].isEditable){
				let new_menu_item = doc.createElement("menuitem");
				new_menu_item.setAttribute('label',CustCols[cc].labelString);
				new_menu_item.setAttribute('colidx',CustCols[cc].index);
				new_menu_item.setAttribute('editType',CustCols[cc].editType);
				container1.appendChild(new_menu_item);
				container2.appendChild(new_menu_item);
			}
		}
		
		
		/*saveDefaultMenuCW.setAttribute('label',_bundleCW.GetStringFromName("ColumnsWizardNFCols.saveDefault"));
		saveDefaultMenuCW.setAttribute('hidden',cw_active?'false':'true');
		//we do this to escape the command xbl event handler
		saveDefaultMenuCW.setAttribute("colindex", "-1");
		saveDefaultMenuCW.setAttribute("class", "menuitem-iconic");
		saveDefaultMenuCW.setAttribute("image","chrome://columnswizard/skin/ico/saveDefaultMenuCW.png");
		saveDefaultMenuCW.onclick=miczColumnsWizard.addCWSaveDefaultMenu_OnClick;
		aPopup.insertBefore(saveDefaultMenuCW,aPopup.lastChild);*/
	},
};
