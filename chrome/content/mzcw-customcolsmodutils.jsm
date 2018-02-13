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

	addContextMenu:function(doc,container1,container2,container3,CustCols,stringCustColIndexMod,first_click_callback,submenu_click_callback){
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

		let arrayCustColIndexMod=new Array();

		if(stringCustColIndexMod!=''){
			arrayCustColIndexMod=JSON.parse(stringCustColIndexMod);
		}

		for(let icc in arrayCustColIndexMod){
			let cc=arrayCustColIndexMod[icc];
			if(CustCols[cc].isEditable){
				let new_menu_item;
				let new_menu_item2;
				let new_menu_item3;
				if(CustCols[cc].editType!=miczColumnsWizard_CustomColsModUtils.editTypeFixedList){	//simple menu
					new_menu_item = doc.createElement("menuitem");
					new_menu_item.setAttribute('label',CustCols[cc].labelString);
					new_menu_item.setAttribute('colidx',CustCols[cc].index);
					new_menu_item.setAttribute('mail_header',CustCols[cc].dbHeader);
					new_menu_item.setAttribute('edit_type',CustCols[cc].editType);
					new_menu_item.onclick=first_click_callback;
					new_menu_item2=new_menu_item.cloneNode(true);
					new_menu_item2.onclick=first_click_callback;
					new_menu_item3=new_menu_item.cloneNode(true);
					new_menu_item3.onclick=first_click_callback;
				}else{	//it's a fixed list, add submenus
					new_menu_item = doc.createElement("menu");
					new_menu_item.setAttribute('label',CustCols[cc].labelString);
					new_menu_item2=new_menu_item.cloneNode(true);
					new_menu_item3=new_menu_item.cloneNode(true);
					let mpp=doc.createElement("menupopup");
					let mpp2=doc.createElement("menupopup");
					let mpp3=doc.createElement("menupopup");
					mpp.setAttribute("onpopupshowing","miczColumnsWizard.checkHeadersEditingMenuList(this);");
					mpp2.setAttribute("onpopupshowing","miczColumnsWizard.checkHeadersEditingMenuList(this);");
					mpp3.setAttribute("onpopupshowing","miczColumnsWizard.checkHeadersEditingMenuList(this);");
					for(let sbi in CustCols[cc].editFixedList){
						let subm = doc.createElement("menuitem");
						subm.setAttribute('id',CustCols[cc].dbHeader+'_'+CustCols[cc].editFixedList[sbi]);
						subm.setAttribute('label',CustCols[cc].editFixedList[sbi]);
						subm.setAttribute('colidx',CustCols[cc].index);
						subm.setAttribute('mail_header',CustCols[cc].dbHeader);
						subm.onclick=submenu_click_callback;
						let subm2=subm.cloneNode(true);
						subm2.onclick=submenu_click_callback;
						let subm3=subm.cloneNode(true);
						subm3.onclick=submenu_click_callback;
						mpp.appendChild(subm);
						mpp2.appendChild(subm2);
						mpp3.appendChild(subm3);
					}
					new_menu_item.appendChild(mpp);
					new_menu_item2.appendChild(mpp2);
					new_menu_item3.appendChild(mpp3);
				}
				container1.appendChild(new_menu_item);
				container2.appendChild(new_menu_item2);
				container3.appendChild(new_menu_item3);
			}
		}
	},
};
