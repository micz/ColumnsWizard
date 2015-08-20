"use strict";

var EXPORTED_SYMBOLS = ["miczColumnsWizard_MsgUtils"];

var miczColumnsWizard_MsgUtils = {

	messenger:null,

	getMsgHeaderValue:function(msgURI,header){
		var mms = miczColumnsWizard_MsgUtils.messenger.messageServiceFromURI(msgURI).QueryInterface(Components.interfaces.nsIMsgMessageService);
		let hdr = mms.messageURIToMsgHdr(msgURI);
		dump(">>>>>>>>>>>>> miczColumnsWizard_MsgUtils [getMsgHeader]: hrd: "+JSON.stringify(hdr.getStringProperty(header))+" - header: "+header+"\r\n");
		return hdr.getStringProperty(header);
	},

};
