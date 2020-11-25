"use strict";

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

var { miczColumnsWizardPrefsUtils } = ChromeUtils.import("chrome://columnswizard/content/mzcw-prefsutils.jsm");
var { miczColumnsWizard_CustomColsModUtils } = ChromeUtils.import("chrome://columnswizard/content/mzcw-customcolsmodutils.jsm");
var { miczColumnsWizardPref_CustomColsList } = ChromeUtils.import("chrome://columnswizard/content/mzcw-customcolslist.jsm");
var { OS } = ChromeUtils.import("resource://gre/modules/osfile.jsm");

var miczColumnsWizard = {};
var miczColumnsWizardPref_CustColEditor = {

	_sanitize_ID_regex: "([A-Za-z0-9_-]+)",
	_sanitize_dbHeader_regex: "([\x21-\x7E2]+)",

	onLoad: function () {
		console.debug('CW editorload');
		if ("arguments" in window && window.arguments[0]) {
			let args = window.arguments[0];

			if ("action" in args) {
				switch (args.action) {
					// case "new": //window.document.getElementById("ColumnsWizard.dbHeader").setAttribute("value","ok");
					// break;
					case "edit": {
						let currcol = JSON.parse(args.currcol);
						console.debug(currcol);
						let _bundleCW = Services.strings.createBundle("chrome://columnswizard/locale/mzcw-settings-customcolseditor.properties");
						document.getElementById("cw_desc.label").label = _bundleCW.GetStringFromName("ColumnsWizard.DescEdit.label");

						// fill the fields
						document.getElementById("ColumnsWizard.id").setAttribute("value", currcol.index);
						document.getElementById("ColumnsWizard.dbHeader").setAttribute("value", currcol.dbHeader);
						document.getElementById("ColumnsWizard.labelString").setAttribute("value", currcol.labelString);

						if ((currcol.labelImagePath) && (currcol.labelImagePath !== "")) {
							this.setIconUI(currcol.labelImagePath);
						}

						document.getElementById("ColumnsWizard.tooltipString").setAttribute("value", currcol.tooltipString);
						document.getElementById("ColumnsWizard.sortnumber").setAttribute("checked", currcol.sortnumber);
						document.getElementById("ColumnsWizard.searchable").setAttribute("checked", currcol.isSearchable);
						document.getElementById("ColumnsWizard.enabled").setAttribute("checked", currcol.enabled);

						// disable the ID and dbheader field
						document.getElementById("ColumnsWizard.id").setAttribute("readonly", true);
						document.getElementById("ColumnsWizard.dbHeader").setAttribute("readonly", true);
						document.getElementById("ColumnsWizard.labelString").focus();

						// mod data
						if (currcol.isEditable !== undefined) {
							document.getElementById("ColumnsWizard.mod").setAttribute("checked", currcol.isEditable);
							document.getElementById("ColumnsWizard.mod2").setAttribute("checked", currcol.isEditable);
						}
						if (currcol.editType !== undefined) {
							document.getElementById("ColumnsWizard.mod_type_freetext").setAttribute("selected", currcol.editType === document.getElementById("ColumnsWizard.mod_type_freetext").value);
							document.getElementById("ColumnsWizard.mod_type_number").setAttribute("selected", currcol.editType === document.getElementById("ColumnsWizard.mod_type_number").value);
							document.getElementById("ColumnsWizard.mod_type_fixedlist").setAttribute("selected", currcol.editType === document.getElementById("ColumnsWizard.mod_type_fixedlist").value);
							document.getElementById("ColumnsWizard.mod_type_group").value = currcol.editType;
							if (currcol.editType !== document.getElementById("ColumnsWizard.mod_type_fixedlist").value) {	// we are doing this because here this.enableHeaderFixedList() is not working!
								document.getElementById('ColumnsWizard.mod_type_fixedlist.list').disabled = true;
								document.getElementById('ColumnsWizard.mod_type_fixedlist.list.desc').disabled = true;
							} else {
								document.getElementById('ColumnsWizard.mod_type_fixedlist.list').disabled = false;
								document.getElementById('ColumnsWizard.mod_type_fixedlist.list.desc').disabled = false;
							}
							console.debug('Monotype ');
							console.debug(document.getElementById("ColumnsWizard.mod_type_fixedlist").getAttribute("checked"));
						}
						if (currcol.editFixedList !== undefined) {
							 document.getElementById("ColumnsWizard.mod_type_fixedlist.list").textContent = (currcol.editFixedList).join("\r\n");
						}

						// set the value on the label in the advanced tab
						document.getElementById('cw_adv_msg_header').setAttribute("value", currcol.dbHeader);
						break;
					}
				}
			}
		}
		// Fixing window height
		this.fixWinHeight();
		this.enableAdvancedTabContent();
	},

	onAccept: function () {
		console.debug('Accept');
		if (!miczColumnsWizardPref_CustColEditor.checkFields()) {
			return false;
		}

		if ("arguments" in window && window.arguments[0]) {
			let args = window.arguments[0];
			let newcol = {};

			let re_id = new RegExp(miczColumnsWizardPref_CustColEditor._sanitize_ID_regex, 'ig');
			let re_dbh = new RegExp(miczColumnsWizardPref_CustColEditor._sanitize_dbHeader_regex, 'g');

			if ("action" in args) {
				switch (args.action) {
					case "new": { // Save new custom column
						// fixed val
						newcol.isBundled = false;
						newcol.isCustom = true;
						newcol.def = "";
						// get userinput val
						if (document.getElementById("ColumnsWizard.id").value.match(re_id) !== null) {
							let index = document.getElementById("ColumnsWizard.id").value.match(re_id).join('');
							console.debug('new index');
							console.debug(index);
							newcol.index = index.toLowerCase();
						} else {
							newcol.index = document.getElementById("ColumnsWizard.id").value.toLowerCase();
						}
						console.debug(newcol.index);

						// Check if the custom column is already present
						// let prefsc = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
						// let prefs = prefsc.getBranch("extensions.ColumnsWizard.CustCols.");
						// let CustColIndexStr=prefs.getCharPref("index");
						let CustColIndexStr = miczColumnsWizardPrefsUtils.getCustColsIndex();
						let CustColIndex = [];
						if (CustColIndexStr !== '') {
							CustColIndex = JSON.parse(CustColIndexStr);
							// dump(">>>>>>>>>>>>> miczColumnsWizard->onAccept: [newcol.index] "+JSON.stringify(newcol.index)+"\r\n");
							if (CustColIndex.includes(newcol.index)) {
								// custom column already present
								// dump(">>>>>>>>>>>>> miczColumnsWizard->onAccept: [CustColIndex] "+JSON.stringify(CustColIndex)+"\r\n");
								let _bundleCW = Services.strings.createBundle("chrome://columnswizard/locale/mzcw-settings-customcolseditor.properties");
								let prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
								prompts.alert(window,
									_bundleCW.GetStringFromName("ColumnsWizard.emptyFields.title"),
									_bundleCW.GetStringFromName("ColumnsWizard.duplicatedID.text"));
								return false;
							}
						}

						if (document.getElementById("ColumnsWizard.dbHeader").value.match(re_dbh) !== null) {
							newcol.dbHeader = document.getElementById("ColumnsWizard.dbHeader").value.match(re_dbh).join('').replace(':', '').toLowerCase();
						} else {
							newcol.dbHeader = document.getElementById("ColumnsWizard.dbHeader").value.toLowerCase();
						}
						newcol.labelImagePath = miczColumnsWizardPref_CustColEditor.saveIcon(document.getElementById("ColumnsWizard.iconString").value, newcol.index);
						newcol.labelString = document.getElementById("ColumnsWizard.labelString").value;
						newcol.tooltipString = document.getElementById("ColumnsWizard.tooltipString").value;
						newcol.sortnumber = document.getElementById("ColumnsWizard.sortnumber").checked;
						newcol.isSearchable = document.getElementById("ColumnsWizard.searchable").checked;
						newcol.enabled = document.getElementById("ColumnsWizard.enabled").checked;

						// mod data
						newcol.isEditable = document.getElementById("ColumnsWizard.mod").checked;
						newcol.editType = document.getElementById("ColumnsWizard.mod_type_group").value;
						newcol.editFixedList = miczColumnsWizard_CustomColsModUtils.getFixedListArray(document.getElementById("ColumnsWizard.mod_type_fixedlist.list").value);

						// dump(">>>>>>>>>>>>> miczColumnsWizard->onAccept: [newcol] "+JSON.stringify(newcol)+"\r\n");
						// miczColumnsWizard_CustCols.addNewCustCol(newcol);
						window.arguments[0].save = true;
						window.arguments[0].newcol = newcol;
						break;
					}
					case "edit": { // Modify the custom column
						let currcol = JSON.parse(args.currcol);
						console.debug('current column');
						console.debug(currcol);
						// fixed val
						newcol.isBundled = false;
						newcol.isCustom = true;
						newcol.def = "";
						// get userinput val
						newcol.index = currcol.index;
						newcol.dbHeader = currcol.dbHeader;
						newcol.labelImagePath = miczColumnsWizardPref_CustColEditor.saveIcon(document.getElementById("ColumnsWizard.iconString").value, newcol.index);
						if (newcol.labelImagePath === "") {	// no image, try to delete it, maybe we are modifying and removing an image
							this.deleteIcon(newcol.dbHeader);
						}
						newcol.labelString = document.getElementById("ColumnsWizard.labelString").value;
						newcol.tooltipString = document.getElementById("ColumnsWizard.tooltipString").value;
						newcol.sortnumber = document.getElementById("ColumnsWizard.sortnumber").checked;
						newcol.isSearchable = document.getElementById("ColumnsWizard.searchable").checked;
						newcol.enabled = document.getElementById("ColumnsWizard.enabled").checked;

						// mod data
						newcol.isEditable = document.getElementById("ColumnsWizard.mod").checked;
						newcol.editType = document.getElementById("ColumnsWizard.mod_type_group").value;
						newcol.editFixedList = miczColumnsWizard_CustomColsModUtils.getFixedListArray(document.getElementById("ColumnsWizard.mod_type_fixedlist.list").value);

						// dump(">>>>>>>>>>>>> miczColumnsWizard->onAccept: [newcol] "+JSON.stringify(newcol)+"\r\n");
						// miczColumnsWizard_CustCols.addNewCustCol(newcol);
						window.arguments[0].save = true;
						window.arguments[0].newcol = newcol;
						break;
					}
				}
			}
		}

		return true;
	},

	checkFields: function () {
		// The fields must be filled!!
		// The input are already sanitized elsewhere...
		if ((document.getElementById("ColumnsWizard.id").value === "") || (document.getElementById("ColumnsWizard.dbHeader").value === "") || (document.getElementById("ColumnsWizard.labelString").value === "") || (document.getElementById("ColumnsWizard.tooltipString").value === "")) {
			let _bundleCW = Services.strings.createBundle("chrome://columnswizard/locale/mzcw-settings-customcolseditor.properties");
			let prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
			prompts.alert(window,
				_bundleCW.GetStringFromName("ColumnsWizard.emptyFields.title"),
				_bundleCW.GetStringFromName("ColumnsWizard.emptyFields.text"));
			return false;
		}
		return true;
	},

	onBlur_sanitize_ID: function () {
		let re = new RegExp(miczColumnsWizardPref_CustColEditor._sanitize_ID_regex, 'ig');
		let el = document.getElementById('ColumnsWizard.id');
		if (el.value.match(re) !== null) {
			el.value = el.value.match(re).join('');
		}
	},

	onBlur_sanitize_dbHeader: function () {
		let re = new RegExp(miczColumnsWizardPref_CustColEditor._sanitize_dbHeader_regex, 'g');
		let el = document.getElementById('ColumnsWizard.dbHeader');
		if (el.value.match(re) !== null) {
			el.value = el.value.match(re).join('').replace(':', '');
		}
		// set the value on the label in the advanced tab
		document.getElementById('cw_adv_msg_header').value = el.value;
	},

	setIconUI: function (iconpath) {
		document.getElementById("ColumnsWizard.iconString").setAttribute("value", iconpath);
		// document.getElementById("ColumnsWizard.iconString").setAttribute("hidden",false);
		document.getElementById("ColumnsWizard.setIcon_btn").setAttribute("image", "file://" + iconpath);
		document.getElementById("ColumnsWizard.removeIcon_btn").setAttribute("disabled", false);
		this.fixWinHeight();
	},

	removeIconUI: function () {
		document.getElementById("ColumnsWizard.iconString").setAttribute("value", "");
		// document.getElementById("ColumnsWizard.iconString").setAttribute("hidden",true);
		document.getElementById("ColumnsWizard.setIcon_btn").setAttribute("image", "");
		document.getElementById("ColumnsWizard.removeIcon_btn").setAttribute("disabled", true);
		this.fixWinHeight();
	},

	chooseIcon: function () {
		let _bundleCW = Services.strings.createBundle("chrome://columnswizard/locale/mzcw-settings-customcolseditor.properties");
		let fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
		fp.init(window, _bundleCW.GetStringFromName("ColumnsWizard.chooseIcon.title") + "...", Ci.nsIFilePicker.modeOpen);
		fp.appendFilters(Ci.nsIFilePicker.filterImages);

		let fpCallback = function fpCallback_done(aResult) {
			// dump(">>>>>>>>>>>>> miczColumnsWizard->chooseIcon: [aResult] "+JSON.stringify(aResult)+"\r\n");
			if (aResult === Ci.nsIFilePicker.returnOK) {
				try {
					if (fp.file) {
						// dump(">>>>>>>>>>>>> miczColumnsWizard->chooseIcon: [file.path] "+JSON.stringify(fp.file.path)+"\r\n");
						miczColumnsWizardPref_CustColEditor.setIconUI(fp.file.path);
					}
				} catch (ex) {
					dump(">>>>>>>>>>>>> miczColumnsWizard->chooseIcon: [ex.message] " + JSON.stringify(ex.message) + "\r\n");
				}
			}
		};

		let localFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
		fp.displayDirectory = localFile;
		fp.open(fpCallback);
	},

	saveIcon: function (filepath, newname) {
		if (filepath === "") return "";
		// save the choosen icon in the user profile folder
		let file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
		file.initWithPath(filepath);
		try {
			if (file) {
				let destPath = OS.Path.join(OS.Constants.Path.profileDir, "columnswizardmiczit");
				OS.File.makeDir(destPath, { ignoreExisting: true });
				let destFullPath = OS.Path.join(destPath, newname);
				// dump(">>>>>>>>>>>>> miczColumnsWizard->saveIcon: [file.path] "+JSON.stringify(file.path)+"\r\n");
				// dump(">>>>>>>>>>>>> miczColumnsWizard->saveIcon: [destPath] "+JSON.stringify(destPath)+"\r\n");
				if (!file.path.includes(destPath)) {	// if the icon is already in the dest folder (we're modifying a cust col), do nothing!
					OS.File.copy(file.path, destFullPath);
				}
				return destFullPath;
			}
		} catch (ex) {
			dump(">>>>>>>>>>>>> miczColumnsWizard->saveIcon: [ex.message] " + JSON.stringify(ex.message) + "\r\n");
		}
		return "";
	},

	deleteIcon: function (filename) {
		let destPath = OS.Path.join(OS.Constants.Path.profileDir, "columnswizardmiczit");
		let filepath = OS.Path.join(destPath, filename);
		OS.File.remove(filepath);
	},

	enableAdvancedTabContent: function () {
		let disabled = !document.getElementById('ColumnsWizard.mod').checked;
		document.getElementById('ColumnsWizard.mod_type.desc').disabled = disabled;
		document.getElementById('ColumnsWizard.mod_type_group').disabled = disabled;
	},

	clickColumnsWizard_mod: function () {
		document.getElementById('ColumnsWizard.mod2').checked = document.getElementById('ColumnsWizard.mod').checked;
		miczColumnsWizardPref_CustColEditor.enableAdvancedTabContent();
	},

	clickColumnsWizard_mod2: function () {
		document.getElementById('ColumnsWizard.mod').checked = document.getElementById('ColumnsWizard.mod2').checked;
		miczColumnsWizardPref_CustColEditor.enableAdvancedTabContent();
	},

	enableHeaderFixedList: function () {
		let disable = !document.getElementById('ColumnsWizard.mod_type_fixedlist').selected;
		document.getElementById('ColumnsWizard.mod_type_fixedlist.list').disabled = disable;
		document.getElementById('ColumnsWizard.mod_type_fixedlist.list.desc').disabled = disable;
	},

	sanitizeFixedListInput: function () {
		document.getElementById("ColumnsWizard.mod_type_fixedlist.list").value = document.getElementById("ColumnsWizard.mod_type_fixedlist.list").value.replace("|", " ");
	},

	fixWinHeight: function () {
		sizeToContent();
		var vbox = document.getElementById('cw_vbox');
		vbox.height = vbox.boxObject.height;
		sizeToContent();
	},

};

document.addEventListener("dialogaccept", function (event) {
	miczColumnsWizardPref_CustColEditor.onAccept();
});

window.addEventListener("load", function (event) {
	miczColumnsWizardPref_CustColEditor.onLoad();
});

