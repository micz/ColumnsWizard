"use strict";
/* *
 * Many of the ideas, know how and actual code used in this module
 * are taken from the "Header Tools Lite" addon (https://addons.mozilla.org/en-US/thunderbird/addon/header-tools-lite/)
 * made by Paolo "Kaosmos".
 * */

var EXPORTED_SYMBOLS = ["miczColumnsWizard_MsgUtils"];

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

var { miczColumnsWizardPrefsUtils } = ChromeUtils.import("chrome://columnswizard/content/mzcw-prefsutils.jsm");
var { miczLogger } = ChromeUtils.import("chrome://columnswizard/content/modules/miczLogger.jsm");


// cleidigh - Use correct module - avoids deprecation warning
// mailServices.js => MailServices.jsm in TB63+
const info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
// Services.console.logStringMessage("Thunderbird Version: " + info.version + "\n");

if (parseInt(info.version.split('.')[0],10)  >= 61) {
	// Services.console.logStringMessage('MailServices.jsm - TB61+');
	var { MailServices } = ChromeUtils.import("resource:///modules/MailServices.jsm");
} else {
	// Services.console.logStringMessage('mailServices.js - TB60');
	var { MailServices } = ChromeUtils.import("resource:///modules/mailServices.js");
}

var { XPCOMUtils } = ChromeUtils.import("resource://gre/modules/XPCOMUtils.jsm");
// const { toXPCOMArray } = ChromeUtils.import("resource:///modules/iteratorUtils.jsm"); // for toXPCOMArray

var miczColumnsWizard_MsgUtils = {

	win: null,
	list: null,
	messenger: null,
	mms: null,
	folder: null,
	hdr: null,
	current_header: '',
	new_header_value: '',
	noTrash: false,
	gDBView: null,
	msgWindow: null,
	mailServices: null,
	tags: null,

	init: function (messenger, msgURI, gDBView, msgWindow, win) {
		miczColumnsWizard_MsgUtils.messenger = messenger;
		miczColumnsWizard_MsgUtils.mms = miczColumnsWizard_MsgUtils.messenger.messageServiceFromURI(msgURI).QueryInterface(Ci.nsIMsgMessageService);
		miczColumnsWizard_MsgUtils.hdr = miczColumnsWizard_MsgUtils.mms.messageURIToMsgHdr(msgURI);
		miczColumnsWizard_MsgUtils.msgURI = msgURI;
		miczColumnsWizard_MsgUtils.folder = miczColumnsWizard_MsgUtils.hdr.folder;
		miczColumnsWizard_MsgUtils.gDBView = gDBView;
		miczColumnsWizard_MsgUtils.msgWindow = msgWindow;
		miczColumnsWizard_MsgUtils.win = win;
		miczColumnsWizard_MsgUtils.mailServices = MailServices;
		miczColumnsWizard_MsgUtils.tags = miczColumnsWizard_MsgUtils.msgHdrGetTags(miczColumnsWizard_MsgUtils.hdr);
		// miczLogger.log('miczColumnsWizard_MsgUtils.init miczColumnsWizard_MsgUtils.msgHdrGetTags: '+miczColumnsWizard_MsgUtils.tags);
	},

	setCurrentHeader: function (header) {
		miczColumnsWizard_MsgUtils.current_header = header;
	},

	getMsgHeaderValue: function (header) {
		// dump(">>>>>>>>>>>>> miczColumnsWizard_MsgUtils [getMsgHeader]: hrd: "+JSON.stringify(miczColumnsWizard_MsgUtils.hdr.getStringProperty(header))+" - header: "+header+"\r\n");
		return miczColumnsWizard_MsgUtils.hdr.getStringProperty(header);
	},

	saveMsg: function (value, msgURI, listener) {
		miczColumnsWizard_MsgUtils.new_header_value = value;
		miczColumnsWizard_MsgUtils.mms.streamMessage(msgURI, listener, null, null, false, null);
	},

	// parses headers to find the original Date header, not present in nsImsgDbHdr
	getOrigDate: function () {
		let dateOrig = "";
		let splitted = null;
		try {
			let str_message = miczColumnsWizard_MsgUtils.listener.text;
			// This is the end of the headers
			let end = str_message.search(/\r?\n\r?\n/);
			if (str_message.indexOf("\nDate") > -1 && str_message.indexOf("\nDate") < end)
				splitted = str_message.split("\nDate:");
			else if (str_message.indexOf("\ndate") > -1 && str_message.indexOf("\ndate") < end)
				splitted = str_message.split("\ndate:");
			if (splitted) {
				dateOrig = splitted[1].split("\n")[0];
				dateOrig = dateOrig.replace(/ +$/, "");
				dateOrig = dateOrig.replace(/^ +/, "");
			}
		} catch (e) {
			// Nothing
		}
		return dateOrig;
	},

	cleanCRLF: function (data) {
		/*	This function forces all newline as CRLF; this is useful for some reasons
			1) this will make the message RFC2822 compliant
			2) this will fix some problems with IMAP servers that don't accept mixed newlines
			3) this will make easier to use regexps
			*/
		let newData = data.replace(/\r/g, "");
		newData = newData.replace(/\n/g, "\r\n");
		return newData;
	},

	postActions: function (key) {
		// miczLogger.log('miczColumnsWizard_MsgUtils.postActions START');
		miczColumnsWizard_MsgUtils.gDBView.selectMsgByKey(key); // select message with modified headers/source
		let hdr = miczColumnsWizard_MsgUtils.folder.GetMessageHeader(key);
		// miczLogger.log('miczColumnsWizard_MsgUtils.postActions HDR DONE');
		if (hdr.flags & 2) {
			miczColumnsWizard_MsgUtils.folder.addMessageDispositionState(hdr, 0); // set replied if necessary
			// miczLogger.log('miczColumnsWizard_MsgUtils.postActions REPLIED SET');
		}
		if (hdr.flags & 4096) {
			miczColumnsWizard_MsgUtils.folder.addMessageDispositionState(hdr, 1); // set fowarded if necessary
			// miczLogger.log('miczColumnsWizard_MsgUtils.postActions FORWARDED SET');
		}
		// set labels if needed
		// miczLogger.log('miczColumnsWizard_MsgUtils.postActions SETTING LABELS');
		// miczLogger.log('miczColumnsWizard_MsgUtils.postActions miczColumnsWizard_MsgUtils.tags: '+miczColumnsWizard_MsgUtils.tags.join(" "));
		// Check
		// cleidigh Check arrays

		// miczColumnsWizard_MsgUtils.folder.addKeywordsToMessages(toXPCOMArray([hdr], Ci.nsIMutableArray), miczColumnsWizard_MsgUtils.tags.join(" "));
		// miczLogger.log('miczColumnsWizard_MsgUtils.postActions LABELS SET');
	},

	/**
	 * Given a msgHdr, return a list of tag objects. This function
	 * just does the messy work of understanding how tags are
	 * stored in nsIMsgDBHdrs.
	 */
	msgHdrGetTags: function (aMsgHdr) {
		let keywords = aMsgHdr.getStringProperty("keywords");
		let keywordList = keywords.split(' ');
		// miczLogger.log('miczColumnsWizard_MsgUtils.msgHdrGetTags keywords: '+keywords);
		// miczLogger.log('miczColumnsWizard_MsgUtils.msgHdrGetTags keywordList: '+keywordList);
		return keywordList;
	},
};

miczColumnsWizard_MsgUtils.listener = {

	text: "",

	// Manual query => XPCOMUtils => ChromeUtils.generateQI (for TB64+ )
	QueryInterface: (XPCOMUtils.generateQI && XPCOMUtils.generateQI([Ci.nsIStreamListener, Ci.nsISupports]) ||
		ChromeUtils.generateQI([Ci.nsIStreamListener, Ci.nsISupports])),

	// onStartRequest: function (aRequest, aContext) {
	onStartRequest: function (aRequest) {
		miczColumnsWizard_MsgUtils.listener.text = "";
	},

	// onStopRequest: function (aRequest, aContext, aStatusCode) {
	onStopRequest: function (aRequest, aStatusCode) {
		let isImap = (miczColumnsWizard_MsgUtils.folder.server.type === "imap");
		let date = miczColumnsWizard_MsgUtils.getOrigDate();

		let data = miczColumnsWizard_MsgUtils.cleanCRLF(miczColumnsWizard_MsgUtils.listener.text);
		let endHeaders = data.search(/\r\n\r\n/);
		let headers = data.substring(0, endHeaders);

		// unfold headers, if necessary
		while (headers.match(/\r\nSubject: .*\r\n\s+/))
			headers = headers.replace(/(\r\nSubject: .*)(\r\n\s+)/, "$1 ");
		while (headers.match(/\r\nFrom: .*\r\n\s+/))
			headers = headers.replace(/(\r\nFrom: .*)(\r\n\s+)/, "$1 ");
		while (headers.match(/\r\nTo: .*\r\n\s+/))
			headers = headers.replace(/(\r\nTo: .*)(\r\n\s+)/, "$1 ");

		// This will be removed after the if-else_if-else series, it will make easier to test headers
		headers = "\n" + headers;

		let currStrHeader = "\n" + miczColumnsWizard_MsgUtils.current_header + ":";
		let mimeEncoder = Cc["@mozilla.org/messenger/mimeconverter;1"].getService(Ci.nsIMimeConverter);
		let newHeaderEnc = mimeEncoder.encodeMimePartIIStr_UTF8(miczColumnsWizard_MsgUtils.new_header_value, false, "UTF-8", 0, 72);

		let re = new RegExp(currStrHeader + " *.*\r\n", 'ig');
		if (headers.indexOf(currStrHeader) > -1) {
			headers = headers + "\r\n";
			headers = headers.replace(re, currStrHeader + " " + newHeaderEnc + "\r\n");
			// dump(">>>>>>>>>>>>> miczColumnsWizard_MsgUtils [listener]: REPLACING HEADER\r\n");
			// dump(">>>>>>>>>>>>> miczColumnsWizard_MsgUtils [listener]: headers: "+headers+"\r\n");
			headers = headers.substring(0, headers.length - 2);
		} else { // header is missing
			headers = headers + "\r" + currStrHeader + " " + newHeaderEnc + "\r\n";
			// dump(">>>>>>>>>>>>> miczColumnsWizard_MsgUtils [listener]: ADDING HEADER\r\n");
		}

		// dump(">>>>>>>>>>>>> miczColumnsWizard_MsgUtils [listener]: newHeaderEnc: "+newHeaderEnc+"\r\n");
		// dump(">>>>>>>>>>>>> miczColumnsWizard_MsgUtils [listener]: headers: "+headers+"\r\n");

		headers = headers.substring(1);
		data = headers + data.substring(endHeaders);
		// let action = "headerChanged";

		// strips off some useless headers
		/* data = data.replace(/^From - .+\r\n/, "");
		data = data.replace(/X-Mozilla-Status.+\r\n/, "");
		data = data.replace(/X-Mozilla-Status2.+\r\n/, "");
		data = data.replace(/X-Mozilla-Keys.+\r\n/, "");*/

		/* if (HeaderToolsLiteObj.prefs.getBoolPref("extensions.hdrtoolslite.add_htl_header")) {
			let now = new Date;
			let HTLhead = "X-HeaderToolsLite: "+action+" - "+now.toString();
			HTLhead = HTLhead.replace(/\(.+\)/, "");
			HTLhead = HTLhead.substring(0,75);
			if (data.indexOf("\nX-HeaderToolsLite: ") <0)
				data = data.replace("\r\n\r\n","\r\n"+HTLhead+"\r\n\r\n");
			else
				data = data.replace(/\nX-HeaderToolsLite: .+\r\n/,"\n"+HTLhead+"\r\n");
		}*/

		if (isImap && miczColumnsWizardPrefsUtils.useImapFix) {
			// Some IMAP provider (for ex. GMAIL) doesn't register changes in source if the main headers
			// are not different from an existing message. To work around this limit, the "Date" field is
			// modified, if necessary, adding a second to the time (or decreasing a second if second are 59)
			let newDate = date.replace(/(\d{2}):(\d{2}):(\d{2})/, function (str, p1, p2, p3) {
				let z = parseInt(p3) + 1;
				if (z > 59) z = 58;
				if (z < 10) z = "0" + z.toString();
				return p1 + ":" + p2 + ":" + z;
			});
			data = data.replace(date, newDate);
		}

		// dump(">>>>>>>>>>>>> miczColumnsWizard_MsgUtils [listener]: data: "+data+"\r\n");

		// creates the temporary file, where the modified message body will be stored
		let tempFile = Cc["@mozilla.org/file/directory_service;1"].
			getService(Ci.nsIProperties).
			get("TmpD", Ci.nsIFile);
		tempFile.append("HT.eml");
		tempFile.createUnique(0, parseInt("0600", 8));
		let foStream = Cc["@mozilla.org/network/file-output-stream;1"]
			.createInstance(Ci.nsIFileOutputStream);
		foStream.init(tempFile, 2, 0x200, false); // open as "write only"
		foStream.write(data, data.length);
		foStream.close();

		let flags = miczColumnsWizard_MsgUtils.hdr.flags;
		let keys = miczColumnsWizard_MsgUtils.hdr.getStringProperty("keywords");

		miczColumnsWizard_MsgUtils.list = Cc["@mozilla.org/array;1"].createInstance(Ci.nsIMutableArray);
		miczColumnsWizard_MsgUtils.list.appendElement(miczColumnsWizard_MsgUtils.hdr, false);

		// this is interesting: nsIMsgFolder.copyFileMessage seems to have a bug on Windows, when
		// the nsIFile has been already used by foStream (because of Windows lock system?), so we
		// must initialize another nsIFile object, pointing to the temporary file
		let fileSpec = Cc["@mozilla.org/file/local;1"]
			.createInstance(Ci.nsIFile);
		fileSpec.initWithPath(tempFile.path);
		let fol = miczColumnsWizard_MsgUtils.hdr.folder;
		let extService = Cc['@mozilla.org/uriloader/external-helper-app-service;1']
			.getService(Ci.nsPIExternalAppLauncher);
		extService.deleteTemporaryFileOnExit(fileSpec); // function's name says all!!!
		miczColumnsWizard_MsgUtils.noTrash = !miczColumnsWizardPrefsUtils.putOriginalInTrash;
		// Moved in copyListener.onStopCopy
		// miczColumnsWizard_MsgUtils.folder.deleteMessages(miczColumnsWizard_MsgUtils.list,null,miczColumnsWizard_MsgUtils.noTrash,true,null,false);
		let cs = Cc["@mozilla.org/messenger/messagecopyservice;1"].getService(Ci.nsIMsgCopyService);
		cs.CopyFileMessage(fileSpec, fol, null, false, flags, keys, miczColumnsWizard_MsgUtils.copyListener, miczColumnsWizard_MsgUtils.msgWindow);
	},

	// onDataAvailable: function (aRequest, aContext, aInputStream, aOffset, aCount) {
	onDataAvailable: function (aRequest, aInputStream, aOffset, aCount) {
	let scriptStream = Cc["@mozilla.org/scriptableinputstream;1"].createInstance().QueryInterface(Ci.nsIScriptableInputStream);
		scriptStream.init(aInputStream);
		miczColumnsWizard_MsgUtils.listener.text += scriptStream.read(scriptStream.available());
	},

};

// copyFileMessage listener
miczColumnsWizard_MsgUtils.copyListener = {

	// Manual query => XPCOMUtils => ChromeUtils.generateQI (for TB64+ )
	QueryInterface: (XPCOMUtils.generateQI && XPCOMUtils.generateQI([Ci.nsIMsgCopyServiceListener, Ci.nsISupports]) ||
		ChromeUtils.generateQI([Ci.nsIMsgCopyServiceListener, Ci.nsISupports])),

	GetMessageId: function (messageId) { },
	OnProgress: function (progress, progressMax) { },
	OnStartCopy: function () { },

	OnStopCopy: function (status) {
		if (status === 0) { // copy done
			miczColumnsWizard_MsgUtils.folder.deleteMessages(miczColumnsWizard_MsgUtils.list, null, miczColumnsWizard_MsgUtils.noTrash, true, null, false);
		}
	},

	SetMessageKey: function (key) {
		// at this point, the message is already stored in local folders, but not yet in remote folders,
		// so for remote folders we use a folderListener
		// miczLogger.log('miczColumnsWizard_MsgUtils.SetMessageKey START');
		if (miczColumnsWizard_MsgUtils.folder.server.type === "imap" || miczColumnsWizard_MsgUtils.folder.server.type === "news") {
			// miczLogger.log('miczColumnsWizard_MsgUtils.SetMessageKey IMAP');
			Cc["@mozilla.org/messenger/services/session;1"]
				.getService(Ci.nsIMsgMailSession)
				.AddFolderListener(miczColumnsWizard_MsgUtils.folderListener, Ci.nsIFolderListener.all);
			miczColumnsWizard_MsgUtils.folderListener.key = key;
			miczColumnsWizard_MsgUtils.folderListener.URI = miczColumnsWizard_MsgUtils.folder.URI;
		} else {
			// miczLogger.log('miczColumnsWizard_MsgUtils.SetMessageKey NOT IMAP');
			miczColumnsWizard_MsgUtils.win.setTimeout(function () { miczColumnsWizard_MsgUtils.postActions(key); }, 500);
		}
	},
};

// used just for remote folders
miczColumnsWizard_MsgUtils.folderListener = {
	OnItemAdded: function (parentItem, item, view) {
		// miczLogger.log('miczColumnsWizard_MsgUtils.folderListener.OnItemAdded START');
		let hdr = null;
		try {
			hdr = item.QueryInterface(Ci.nsIMsgDBHdr);
		} catch (e) { return; }
		if (miczColumnsWizard_MsgUtils.folderListener.key === hdr.messageKey && miczColumnsWizard_MsgUtils.folderListener.URI === hdr.folder.URI) {
			// miczLogger.log('miczColumnsWizard_MsgUtils.folderListener.OnItemAdded DOING POSTACTION');
			miczColumnsWizard_MsgUtils.postActions(miczColumnsWizard_MsgUtils.folderListener.key);
			// we don't need anymore the folderListener
			Cc["@mozilla.org/messenger/services/session;1"].getService(Ci.nsIMsgMailSession).RemoveFolderListener(miczColumnsWizard_MsgUtils.folderListener);
		}
	},

	OnItemRemoved: function (parentItem, item, view) { },
	OnItemPropertyChanged: function (item, property, oldValue, newValue) { },
	OnItemIntPropertyChanged: function (item, property, oldValue, newValue) { },
	OnItemBoolPropertyChanged: function (item, property, oldValue, newValue) { },
	OnItemUnicharPropertyChanged: function (item, property, oldValue, newValue) { },
	OnItemPropertyFlagChanged: function (item, property, oldFlag, newFlag) { },
	OnItemEvent: function (folder, event) { },
};
