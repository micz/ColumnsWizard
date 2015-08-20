"use strict";

var EXPORTED_SYMBOLS = ["miczColumnsWizard_MsgUtils"];

var miczColumnsWizard_MsgUtils = {
	
	messenger:null,

	getMsgHeader:function(msgURI,header){
		var mms = miczColumnsWizard_MsgUtils.messenger.messageServiceFromURI(msgURI).QueryInterface(Components.interfaces.nsIMsgMessageService);
		let hdr = mms.messageURIToMsgHdr(msgURI);
		dump(">>>>>>>>>>>>> miczColumnsWizard_MsgUtils [getMsgHeader]: hrd: "+JSON.stringify(hdr[header])+" - header: "+header+"\r\n");
		return "test";
	},

};
