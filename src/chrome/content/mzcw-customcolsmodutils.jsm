"use strict";

/* global Services */

var EXPORTED_SYMBOLS = ["miczColumnsWizard_CustomColsModUtils"];

var miczColumnsWizard_CustomColsModUtils = {

	editTypeFreeText: 'tx',
	editTypeNumbers: 'nb',
	editTypeFixedList: 'fl',

	getFixedListArray: function (textbox_value) {
		let fl_string = textbox_value.replace(/(?:\r\n|\r|\n)/g, '|');
		return fl_string.split('|');
	},

	addContextMenu: function (doc, container1, container2, container3, CustCols, stringCustColIndexMod, first_click_callback, submenu_click_callback) {
					
		// clear menu items
		while (container1.firstChild) {
			container1.firstChild.remove();
		}
		while (container2.firstChild) {
			container2.firstChild.remove();
		}
		while (container3.firstChild) {
			container3.firstChild.remove();
		}

		let arrayCustColIndexMod = [];

		if (stringCustColIndexMod !== '') {
			// console.debug('ContextMenu');
			// console.debug(stringCustColIndexMod);
			arrayCustColIndexMod = JSON.parse(stringCustColIndexMod);
		}

		for (let icc in arrayCustColIndexMod) {
			let cc = arrayCustColIndexMod[icc];
			if (CustCols[cc].isEditable) {
				let new_menu_item;
				let new_menu_item2;
				let new_menu_item3;
				if (CustCols[cc].editType !== miczColumnsWizard_CustomColsModUtils.editTypeFixedList) {	// simple menu
					// console.debug('SimpleMenu');
					new_menu_item = doc.createXULElement("menuitem");
					new_menu_item.setAttribute('label', CustCols[cc].labelString);
					new_menu_item.setAttribute('colidx', CustCols[cc].index);
					new_menu_item.setAttribute('mail_header', CustCols[cc].dbHeader);
					new_menu_item.setAttribute('edit_type', CustCols[cc].editType);
					new_menu_item.setAttribute('oncommand', 'miczColumnsWizard.editHeaderMenu_OnClick(event)');
					
					// new_menu_item.onclick = first_click_callback;
					new_menu_item2 = new_menu_item.cloneNode(true);
					// new_menu_item2.onclick = first_click_callback;
					new_menu_item3 = new_menu_item.cloneNode(true);
					// new_menu_item3.onclick = first_click_callback;
					
					new_menu_item2.setAttribute('oncommand', 'miczColumnsWizard.editHeaderMenu_OnClick(event)');
					new_menu_item3.setAttribute('oncommand', 'miczColumnsWizard.editHeaderMenu_OnClick(event)');

				} else {	// it's a fixed list, add submenus
					new_menu_item = doc.createXULElement("menu");
					new_menu_item.setAttribute('label', CustCols[cc].labelString);
					new_menu_item.setAttribute('colidx', CustCols[cc].index);
					new_menu_item.setAttribute('mail_header', CustCols[cc].dbHeader);
					new_menu_item.setAttribute('edit_type', CustCols[cc].editType);
					new_menu_item2 = new_menu_item.cloneNode(true);
					new_menu_item3 = new_menu_item.cloneNode(true);
					let mpp = doc.createXULElement("menupopup");
					let mpp2 = doc.createXULElement("menupopup");
					let mpp3 = doc.createXULElement("menupopup");

					// cleidigh - fix warnings from ANT later
					mpp.addEventListener("popupshowing", this.miczColumnsWizard.checkHeadersEditingMenuList, true);
					mpp2.addEventListener("popupshowing", this.miczColumnsWizard.checkHeadersEditingMenuList, true);
					mpp3.addEventListener("popupshowing", this.miczColumnsWizard.checkHeadersEditingMenuList, true);

					for (let sbi in CustCols[cc].editFixedList) {
						let subm = doc.createXULElement("menuitem");
						subm.setAttribute('id', CustCols[cc].dbHeader + '_' + CustCols[cc].editFixedList[sbi]);
						subm.setAttribute('label', CustCols[cc].editFixedList[sbi]);
						subm.setAttribute('colidx', CustCols[cc].index);
						subm.setAttribute('mail_header', CustCols[cc].dbHeader);
						subm.setAttribute('type', 'checkbox');
						// subm.onclick = submenu_click_callback;
						subm.setAttribute('oncommand', 'miczColumnsWizard.editHeaderSubMenu_OnClick()');
						let subm2 = subm.cloneNode(true);
						// subm2.onclick = submenu_click_callback;
						subm2.setAttribute('oncommand', 'miczColumnsWizard.editHeaderSubMenu_OnClick()');
						let subm3 = subm.cloneNode(true);
						// subm3.onclick = submenu_click_callback;
						subm3.setAttribute('oncommand', 'miczColumnsWizard.editHeaderSubMenu_OnClick()');
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
