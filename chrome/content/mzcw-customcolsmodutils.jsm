"use strict";

var EXPORTED_SYMBOLS = ["miczColumnsWizard_CustomColsModUtils"];

var miczColumnsWizard_CustomColsModUtils = {

	//win:{},
	
	getFixedListArray:function(textbox_value){
		let fl_string=textbox_value.replace(/(?:\r\n|\r|\n)/g, '|');
		return fl_string.split('|');
	},		

};
