"use strict";
/* *
 * Many of the ideas, know how and actual code used in this module
 * are taken from the Header Tools Lite addon (https://addons.mozilla.org/en-US/thunderbird/addon/header-tools-lite/)
 * made by Paolo "Kaosmos".
 * */

var EXPORTED_SYMBOLS = ["miczColumnsWizard_MsgUtils"];

var miczColumnsWizard_MsgUtils = {

	list:null,
	messenger:null,
	mms:null,
	folder:null,
	hdr:null,
	current_header:'',
	new_header_value:'',
	noTrash:false,
	gDBView:null,
	
	init(messenger,msgURI,gDBView){
		miczColumnsWizard_MsgUtils.mms = miczColumnsWizard_MsgUtils.messenger.messageServiceFromURI(msgURI).QueryInterface(Components.interfaces.nsIMsgMessageService);
		miczColumnsWizard_MsgUtils.hdr=miczColumnsWizard_MsgUtils.mms.messageURIToMsgHdr(msgURI);
		miczColumnsWizard_MsgUtils.msgURI=msgURI;
		miczColumnsWizard_MsgUtils.folder=miczColumnsWizard_MsgUtils.hdr.folder;
		miczColumnsWizard_MsgUtils.gDBView=gDBView;
	},
	
	setCurrentHeader(header){
		miczColumnsWizard_MsgUtils.current_header=header;
	},

	getMsgHeaderValue:function(header){
		dump(">>>>>>>>>>>>> miczColumnsWizard_MsgUtils [getMsgHeader]: hrd: "+JSON.stringify(miczColumnsWizard_MsgUtils.hdr.getStringProperty(header))+" - header: "+header+"\r\n");
		return miczColumnsWizard_MsgUtils.hdr.getStringProperty(header);
	},
	
	saveMsg(value,msgURI,listener){
		miczColumnsWizard_MsgUtils.new_header_value=value;
		miczColumnsWizard_MsgUtils.mms.streamMessage(msgURI, listener, null, null, false, null);
	},
	
	// parses headers to find the original Date header, not present in nsImsgDbHdr
	getOrigDate:function(){
		let dateOrig = "";
		let splitted = null;
		try {
			let str_message = miczColumnsWizard_MsgUtils.listener.text;
			// This is the end of the headers
			let end = str_message.search(/\r?\n\r?\n/);
			if (str_message.indexOf("\nDate") > -1 && str_message.indexOf("\nDate")  < end) 
				splitted =str_message.split("\nDate:");
			else if (str_message.indexOf("\ndate") > -1 && str_message.indexOf("\ndate")  < end) 
				splitted =str_message.split("\ndate:");
			if (splitted) {
				dateOrig = splitted[1].split("\n")[0];
				dateOrig = dateOrig.replace(/ +$/,"");
				dateOrig = dateOrig.replace(/^ +/,"");
			}
		}
		catch(e) {}
		return dateOrig;
	},
	
	cleanCRLF:function(data){
	/*	This function forces all newline as CRLF; this is useful for some reasons
		1) this will make the message RFC2822 compliant
		2) this will fix some problems with IMAP servers that don't accept mixed newlines
		3) this will make easier to use regexps
		*/
		var newData = data.replace(/\r/g, "");
		newData = newData.replace(/\n/g, "\r\n");
		return newData;
	},
	
	postActions:function(key){
		miczColumnsWizard_MsgUtils.gDBView.selectMsgByKey(key); // select message with modified headers/source
		let hdr = miczColumnsWizard_MsgUtils.folder.GetMessageHeader(key);
		if(hdr.flags & 2){
			miczColumnsWizard_MsgUtils.folder.addMessageDispositionState(hdr,0); //set replied if necessary
		}
	    if(hdr.flags & 4096){ 
			miczColumnsWizard_MsgUtils.folder.addMessageDispositionState(hdr,1); //set fowarded if necessary
		}
	},

};

miczColumnsWizard_MsgUtils.listener = {
	
	text:"",
	
	QueryInterface:function(iid){
		if (iid.equals(Components.interfaces.nsIStreamListener) || iid.equals(Components.interfaces.nsISupports)){
			return this;
		}
		throw Components.results.NS_NOINTERFACE;
		return 0;
	},
	
	onStartRequest:function(aRequest, aContext){
		miczColumnsWizard_MsgUtils.listener.text = "";
	},
	
	onStopRequest:function(aRequest, aContext, aStatusCode){
		let isImap = (miczColumnsWizard_MsgUtils.folder.server.type == "imap") ? true : false;
		let date = miczColumnsWizard_MsgUtils.getOrigDate();
		//let originalSub = HeaderToolsLiteObj.hdr.mime2DecodedSubject;
				
		// we're just changing headers details
		/*let newHdr = {};
		newHdr.author = HeaderToolsLiteObj.hdr.mime2DecodedAuthor;
		newHdr.recipients = HeaderToolsLiteObj.hdr.mime2DecodedRecipients;
		if (HeaderToolsLiteObj.hdr.flags & 0x0010) 
			// in replies the subject returned by mime2DecodedSubject has no initial "Re:"
			originalSub ="Re: "+ originalSub;
		newHdr.subject = originalSub;
		newHdr.date = date;
		newHdr.replyto = HeaderToolsLiteObj.hdr.getStringProperty("replyTo");
		if (HeaderToolsLiteObj.hdr.messageId)
			newHdr.mid = "<"+HeaderToolsLiteObj.hdr.messageId+">";
		newHdr.ref = "";
		var refs = HeaderToolsLiteObj.hdr.numReferences;
		if (refs > 0)
			newHdr.ref = "<"+HeaderToolsLiteObj.hdr.getStringReference(0)+">";
		for (var i=1;i<refs;i++)
			newHdr.ref = newHdr.ref + " <" + HeaderToolsLiteObj.hdr.getStringReference(i)+">";

		window.openDialog('chrome://hdrtoolslite/content/cnghdrs.xul',"","chrome,modal,centerscreen,resizable ",newHdr);

		if (newHdr.cancel) 
			return;

		// encodes the headers in UTF-8. I couldn't use message charset, because sometimes it's null
		var mimeEncoder = Components.classes["@mozilla.org/messenger/mimeconverter;1"]
			.getService(Components.interfaces.nsIMimeConverter);
		var newSubEnc = mimeEncoder.encodeMimePartIIStr_UTF8(newHdr.subject, false, "UTF-8", 0, 72);
		var newAuthEnc = mimeEncoder.encodeMimePartIIStr_UTF8(newHdr.author, true, "UTF-8", 0, 72);		
		var newRecEnc = mimeEncoder.encodeMimePartIIStr_UTF8(newHdr.recipients, true, "UTF-8", 0, 72);
		if (newHdr.replyto)
			var newReplytoEnc = mimeEncoder.encodeMimePartIIStr_UTF8(newHdr.replyto, true, "UTF-8", 0, 72);
		else
			var newReplytoEnc = null;
*/
		let data = miczColumnsWizard_MsgUtils.cleanCRLF(miczColumnsWizard_MsgUtils.listener.text);
		let endHeaders = data.search(/\r\n\r\n/);
		let headers = data.substring(0,endHeaders);

		// unfold headers, if necessary
		while(headers.match(/\r\nSubject: .*\r\n\s+/))
			headers = headers.replace(/(\r\nSubject: .*)(\r\n\s+)/, "$1 ");
		while(headers.match(/\r\nFrom: .*\r\n\s+/))
			headers = headers.replace(/(\r\nFrom: .*)(\r\n\s+)/, "$1 ");
		while(headers.match(/\r\nTo: .*\r\n\s+/))
			headers = headers.replace(/(\r\nTo: .*)(\r\n\s+)/, "$1 ");
		
		// This will be removed after the if-else_if-else series, it will make easier to test headers
		headers = "\n"+headers;
		
		let currStrHeader="\n"+miczColumnsWizard_MsgUtils.current_header+":";
		let mimeEncoder = Components.classes["@mozilla.org/messenger/mimeconverter;1"].getService(Components.interfaces.nsIMimeConverter);
		let newHeaderEnc = mimeEncoder.encodeMimePartIIStr_UTF8(miczColumnsWizard_MsgUtils.new_header_value, false, "UTF-8", 0, 72);
		
		let re=new RegExp(currStrHeader+" *.*\r\n",'ig');
		if (headers.indexOf(currStrHeader) > -1){
			headers = headers.replace(re, currStrHeader+" "+ newHeaderEnc+"\r\n");
		}else{ // header is missing
			headers = headers+("\r"+currStrHeader+" "+newHeaderEnc);
		}
		
		// check also lowercase headers, used for example by SOGO
		/*if (headers.indexOf("\nSubject:") > -1)
			headers = headers.replace(/\nSubject: *.*\r\n/, "\nSubject: "+ newSubEnc+"\r\n");
		else if (headers.indexOf("\nsubject:") > -1)
			headers = headers.replace(/\nsubject: *.*\r\n/, "\nsubject: "+ newSubEnc+"\r\n");
		else // header missing
			headers = headers+("\r\nSubject: "+newSubEnc);
		if (headers.indexOf("\nFrom:") > -1)
			headers = headers.replace(/\nFrom: *.*\r\n/, "\nFrom: "+ newAuthEnc+"\r\n");
		else if (headers.indexOf("\nfrom:") > -1)
			headers = headers.replace(/\nfrom: *.*\r\n/, "\nfrom: "+ newAuthEnc+"\r\n");
		else // header missing
			headers = headers+("\r\nFrom: "+newAuthEnc);
		if (headers.indexOf("\nTo:") > -1)
			headers = headers.replace(/\nTo: *.*\r\n/, "\nTo: "+ newRecEnc+"\r\n");
		else if (headers.indexOf("\nto:") > -1)
			headers = headers.replace(/\nto: *.*\r\n/, "\nto: "+ newRecEnc+"\r\n");
		else // header missing
			headers = headers+("\r\nTo: "+newRecEnc);
		if (headers.indexOf("\nDate:") > -1)
			headers = headers.replace(/\nDate: *.*\r\n/, "\nDate: "+newHdr.date+"\r\n");
		else if (headers.indexOf("\ndate:") > -1)
			headers = headers.replace(/\ndate: *.*\r\n/, "\ndate: "+ newHdr.date+"\r\n");
		else // header missing
			headers = headers+("\r\nDate: "+newHdr.date);
		if (headers.indexOf("\nMessage-ID:") > -1)
			headers = headers.replace(/\nMessage-ID: *.*\r\n/, "\nMessage-ID: "+newHdr.mid+"\r\n");
		else if (newHdr.mid) // header missing
			headers = headers+("\r\nMessage-ID: "+newHdr.mid);
		if (headers.indexOf("\nReferences:") > -1)
			headers = headers.replace(/\nReferences: *.*\r\n/, "\nReferences: "+newHdr.ref+"\r\n");
		else if (newHdr.ref) // header missing
			headers = headers+("\r\nReferences: "+newHdr.ref);
		if (newReplytoEnc) {
			if (headers.indexOf("Reply-To:") > -1)
				headers = headers.replace(/\nReply\-To: *.*\r\n/, "\nReply-To: "+newHdr.replyto+"\r\n");
			if (headers.indexOf("reply-to:") > -1)
				headers = headers.replace(/\nreply\-to: *.*\r\n/, "\nreply-to: "+newHdr.replyto+"\r\n");
			else // header missing
				headers = headers+("\r\nReply-To: "+newHdr.replyto);
		}*/
			
		headers = headers.substring(1);
		data = headers + data.substring(endHeaders);
		let action = "headerChanged";

		// strips off some useless headers
		/*data = data.replace(/^From - .+\r\n/, "");
		data = data.replace(/X-Mozilla-Status.+\r\n/, "");
		data = data.replace(/X-Mozilla-Status2.+\r\n/, "");
		data = data.replace(/X-Mozilla-Keys.+\r\n/, "");*/
			
		/*if (HeaderToolsLiteObj.prefs.getBoolPref("extensions.hdrtoolslite.add_htl_header")) {
			var now = new Date;
			var HTLhead = "X-HeaderToolsLite: "+action+" - "+now.toString();
			HTLhead = HTLhead.replace(/\(.+\)/, "");
			HTLhead = HTLhead.substring(0,75);
			if (data.indexOf("\nX-HeaderToolsLite: ") <0) 
				data = data.replace("\r\n\r\n","\r\n"+HTLhead+"\r\n\r\n");
			else	
				data = data.replace(/\nX-HeaderToolsLite: .+\r\n/,"\n"+HTLhead+"\r\n");
		}*/
					
		if(isImap && miczColumnsWizardPrefsUtils.useImapFix){
			// Some IMAP provider (for ex. GMAIL) doesn't register changes in source if the main headers
			// are not different from an existing message. To work around this limit, the "Date" field is 
			// modified, if necessary, adding a second to the time (or decreasing a second if second are 59)
			let newDate = date.replace(/(\d{2}):(\d{2}):(\d{2})/, function (str, p1, p2, p3) {
				let z = parseInt(p3)+1; 
				if (z > 59) z = 58;
				if (z < 10) z = "0"+z.toString(); 
				return p1+":"+p2+":"+z});
			data = data.replace(date,newDate);
		}

		// creates the temporary file, where the modified message body will be stored
		let tempFile = Components.classes["@mozilla.org/file/directory_service;1"].  
			getService(Components.interfaces.nsIProperties).  
			get("TmpD", Components.interfaces.nsIFile);  
		tempFile.append("HT.eml");
		tempFile.createUnique(0,0600);
		let foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
			.createInstance(Components.interfaces.nsIFileOutputStream);
		foStream.init(tempFile, 2, 0x200, false); // open as "write only"
		foStream.write(data,data.length);
		foStream.close();
				
		let flags =  miczColumnsWizard_MsgUtils.hdr.flags;
		let keys =  miczColumnsWizard_MsgUtils.hdr.getStringProperty("keywords");

		miczColumnsWizard_MsgUtils.list = Components.classes["@mozilla.org/array;1"].createInstance(Components.interfaces.nsIMutableArray);
		miczColumnsWizard_MsgUtils.list.appendElement(miczColumnsWizard_MsgUtils.hdr, false);

		// this is interesting: nsIMsgFolder.copyFileMessage seems to have a bug on Windows, when
		// the nsIFile has been already used by foStream (because of Windows lock system?), so we	
		// must initialize another nsIFile object, pointing to the temporary file
		let fileSpec = Components.classes["@mozilla.org/file/local;1"]
			.createInstance(Components.interfaces.nsILocalFile);
		fileSpec.initWithPath(tempFile.path);
		let fol = HeaderToolsLiteObj.hdr.folder;
		let extService = Components.classes['@mozilla.org/uriloader/external-helper-app-service;1']
			.getService(Components.interfaces.nsPIExternalAppLauncher)
		extService.deleteTemporaryFileOnExit(fileSpec); // function's name says all!!!
		miczColumnsWizard_MsgUtils.noTrash = !miczColumnsWizardPrefsUtils.putOriginalInTrash;
		// Moved in copyListener.onStopCopy
		// miczColumnsWizard_MsgUtils.folder.deleteMessages(miczColumnsWizard_MsgUtils.list,null,miczColumnsWizard_MsgUtils.noTrash,true,null,false);
		let cs = Components.classes["@mozilla.org/messenger/messagecopyservice;1"].getService(Components.interfaces.nsIMsgCopyService);
		cs.CopyFileMessage(fileSpec, fol, null, false, flags, keys, miczColumnsWizard_MsgUtils.copyListener, msgWindow);		
	},
	
	onDataAvailable:function(aRequest, aContext, aInputStream, aOffset, aCount){
		let scriptStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance().QueryInterface(Components.interfaces.nsIScriptableInputStream);
		scriptStream.init(aInputStream);
		miczColumnsWizard_MsgUtils.listener.text+=scriptStream.read(scriptStream.available());
	},
	
};

// copyFileMessage listener
miczColumnsWizard_MsgUtils.copyListener={
	QueryInterface:function(iid){
		if (iid.equals(Components.interfaces.nsIMsgCopyServiceListener) || iid.equals(Components.interfaces.nsISupports)){
			return this;
		}
		throw Components.results.NS_NOINTERFACE;
		return 0;
	},
	
	GetMessageId:function(messageId){},
	OnProgress:function(progress, progressMax){},
	OnStartCopy:function(){},

	OnStopCopy:function(status){
		if(status == 0){ // copy done
			miczColumnsWizard_MsgUtils.folder.deleteMessages(miczColumnsWizard_MsgUtils.list,null,miczColumnsWizard_MsgUtils.noTrash,true,null,false);			
		}
	},

	SetMessageKey:function(key){
		// at this point, the message is already stored in local folders, but not yet in remote folders,
		// so for remote folders we use a folderListener
		if (miczColumnsWizard_MsgUtils.folder.server.type == "imap" || miczColumnsWizard_MsgUtils.folder.server.type == "news") {
			Components.classes["@mozilla.org/messenger/services/session;1"]
					.getService(Components.interfaces.nsIMsgMailSession)
					.AddFolderListener(miczColumnsWizard_MsgUtils.folderListener, Components.interfaces.nsIFolderListener.all);
			miczColumnsWizard_MsgUtils.folderListener.key = key;
			miczColumnsWizard_MsgUtils.folderListener.URI = miczColumnsWizard_MsgUtils.folder.URI;
		}
		else
			setTimeout(function(){miczColumnsWizard_MsgUtils.postActions(key);},500);
	} 
};

// used just for remote folders
miczColumnsWizard_MsgUtils.folderListener={ 
	OnItemAdded:function(parentItem, item, view){
		try{
			let hdr = item.QueryInterface(Components.interfaces.nsIMsgDBHdr);
		}catch(e){return;}
		if (miczColumnsWizard_MsgUtils.folderListener.key == hdr.messageKey && miczColumnsWizard_MsgUtils.folderListener.URI == hdr.folder.URI){
			miczColumnsWizard_MsgUtils.postActions(miczColumnsWizard_MsgUtils.folderListener.key);
			// we don't need anymore the folderListener
			Components.classes["@mozilla.org/messenger/services/session;1"].getService(Components.interfaces.nsIMsgMailSession).RemoveFolderListener(HeaderToolsLiteObj.folderListener);
		}            
	},
	
	OnItemRemoved:function(parentItem, item, view){},
	OnItemPropertyChanged:function(item, property, oldValue, newValue){},
	OnItemIntPropertyChanged:function(item, property, oldValue, newValue){},
	OnItemBoolPropertyChanged:function(item, property, oldValue, newValue){},
	OnItemUnicharPropertyChanged:function(item, property, oldValue, newValue){},
	OnItemPropertyFlagChanged:function(item, property, oldFlag, newFlag){},
	OnItemEvent:function(folder, event){},
};
