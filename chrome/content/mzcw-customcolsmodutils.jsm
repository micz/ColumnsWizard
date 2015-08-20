"use strict";

var EXPORTED_SYMBOLS = ["miczColumnsWizard_CustomColsModUtils"];

var miczColumnsWizard_CustomColsModUtils = {

	editTypeFreeText:'tx',
	editTypeNumbers:'nb',
	editTypeFixedList:'fl',

	getFixedListArray:function(textbox_value){
		let fl_string=textbox_value.replace(/(?:\r\n|\r|\n)/g, '|');
		return fl_string.split('|');
	},

	addContextMenu:function(doc,container1,container2,container3,CustCols,first_click_callback,submenu_click_callback){
		//clear menu items
		while (container1.firstChild) {
			container1.removeChild(container1.firstChild);
		}
		while (container2.firstChild) {
			container2.removeChild(container2.firstChild);
		}
		while (container3.firstChild) {
			container3.removeChild(container3.firstChild);
		}
		
		for(let cc in CustCols){
			if(CustCols[cc].isEditable){
				let new_menu_item;
				if(CustCols[cc].editType!=miczColumnsWizard_CustomColsModUtils.editTypeFixedList){	//simple menu
					new_menu_item = doc.createElement("menuitem");
					new_menu_item.setAttribute('label',CustCols[cc].labelString);
					new_menu_item.setAttribute('colidx',CustCols[cc].index);
					new_menu_item.setAttribute('editType',CustCols[cc].editType);
					new_menu_item.onclick=first_click_callback;
				}else{	//it's a fixed list, add submenus
					new_menu_item = doc.createElement("menu");
					new_menu_item.setAttribute('label',CustCols[cc].labelString);
					let mpp=doc.createElement("menupopup");
					for(let sbi in CustCols[cc].editFixedList){
						let subm = doc.createElement("menuitem");
						subm.setAttribute('label',CustCols[cc].editFixedList[sbi]);
						subm.setAttribute('colidx',CustCols[cc].index);
						subm.onclick=submenu_click_callback;
						mpp.appendChild(subm);
					}
					new_menu_item.appendChild(mpp);
				}
				container1.appendChild(new_menu_item);
				container2.appendChild(new_menu_item.cloneNode(true));
				container3.appendChild(new_menu_item.cloneNode(true));
			}
		}
	},
};
