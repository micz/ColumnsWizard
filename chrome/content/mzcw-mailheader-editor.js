"use strict";
Components.utils.import("chrome://columnswizard/content/mzcw-customcolsmodutils.jsm");

var miczColumnsWizard={};
var miczColumnsWizard_MailHeaderEditor = {
	
	_only_numbers:false,
	_sanitize_value_regex:"^[0-9]*$",

	onLoad: function(){
		//Fixing window height
		this.fixWinHeight();

		if ("arguments" in window && window.arguments[0]){
			let args = window.arguments[0];
			
			this._only_numbers=args.edit_type==miczColumnsWizard_CustomColsModUtils.editTypeNumbers;
			dump(">>>>>>>>>>>>> miczColumnsWizard_MailHeaderEditor: [onLoad]: this._only_numbers: "+JSON.stringify(this._only_numbers)+"\r\n");
			dump(">>>>>>>>>>>>> miczColumnsWizard_MailHeaderEditor: [onLoad]: args.edit_type: "+JSON.stringify(args.edit_type)+"\r\n");
			
			document.getElementById("cw_only_numbers_label").setAttribute("hidden",!this._only_numbers);

			if ("action" in args){
				switch (args.action){
					case "change":
						document.getElementById("ColumnsWizard.mail_header.value").setAttribute("value",args.value);
					break;
				}
			}
		}
	},

	onAccept:function(){

		if ("arguments" in window && window.arguments[0]){
			let args = window.arguments[0];

			if ("action" in args){
				switch (args.action){
					case "change":  //Save new custom column
						window.arguments[0].save=true;
						window.arguments[0].value=document.getElementById("ColumnsWizard.mail_header.value").value;
					break;
				}
			}
		}

		return true;
	},

	onBlur_sanitize_value:function(){
		if(this._only_numbers){
			let re=new RegExp(this._sanitize_value_regex,'ig');
			let el=document.getElementById('ColumnsWizard.mail_header.value');
			if(el.value.match(re)!=null){
				el.value=el.value.match(re).join('');
			}
		}
	},

	fixWinHeight:function(){
		sizeToContent();
		var vbox = document.getElementById('cw_vbox_mhe');
		vbox.height = vbox.boxObject.height;
		sizeToContent();
	},

};
