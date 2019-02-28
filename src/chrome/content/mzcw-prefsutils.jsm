/*
 *	Original code thanks to Axel Grude: https://addons.mozilla.org/en-us/thunderbird/addon/quickfolders-tabbed-folders/
 *
 * */
"use strict";

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

let EXPORTED_SYMBOLS = ["miczColumnsWizardPrefsUtils"];

var miczColumnsWizardPrefsUtils = {
	service: Services.prefs,
	pref_base: 'extensions.ColumnsWizard.',
	pref_custcols: "extensions.ColumnsWizard.CustCols.",
	pref_custcols_def: "extensions.ColumnsWizard.CustCols.def.",
	pref_defcolslist: "extensions.ColumnsWizard.DefaultColsList.",

	get isDebug() {
		return this.getBoolPref_CW("debug");
	},

	get headersEditingActive() {
		return this.getBoolPref_CW("CustCols.mod_active");
	},

	get stringCustColIndexMod() {
		return this.getCharPref_CW("CustCols.index_mod");
	},

	get useImapFix() {
		return this.getBoolPref_CW("MailHeader.use_imap_fix");
	},

	get putOriginalInTrash() {
		return this.getBoolPref_CW("MailHeader.put_original_in_trash");
	},

	get defaultColsListActive() {
		return this.getBoolPref(this.pref_defcolslist + 'active');
	},

	get firstRun() {
		return this.getBoolPref_CW("firstRun");
	},

	firstRunDone: function () {
		this.setBoolPref_CW('firstRun', false);
	},

	getCustColsIndex: function () {
		return this.getCharPref(this.pref_custcols + 'index');
	},

	setCustColsIndex: function (index) {
		this.setCharPref(this.pref_custcols + 'index', index);
	},

	getCustColsActive: function () {
		return this.getBoolPref(this.pref_custcols + 'active');
	},

	setCustColsActive: function (active) {
		this.setBoolPref(this.pref_custcols + 'active', active);
	},

	getCustColsIndexMod: function () {
		return this.getCharPref(this.pref_custcols + 'index_mod');
	},

	setCustColsIndexMod: function (index) {
		this.setCharPref(this.pref_custcols + 'index_mod', index);
	},

	getCustColsModActive: function () {
		return this.getBoolPref(this.pref_custcols + 'mod_active');
	},

	setCustColsModActive: function (mod_active) {
		this.setBoolPref(this.pref_custcols + 'mod_active', mod_active);
	},

	getCustColDef: function (custcol) {
		return this.getCharPref(this.pref_custcols_def + custcol);
	},

	setCustColDef: function (custcol, value) {
		this.setCharPref(this.pref_custcols_def + custcol, value);
	},

	getCustColBool: function (custcol) {
		return this.getBoolPref(this.pref_custcols + custcol);
	},

	setCustColBool: function (custcol, value) {
		this.setBoolPref(this.pref_custcols + custcol, value);
	},

	existsCharPref: function existsCharPref(pref) {
		try {
			if (this.service.prefHasUserValue(pref))
				return true;
			if (this.service.getCharPref(pref))
				return true;
		} catch (e) { return false; }
		return false;
	},

	existsBoolPref: function existsBoolPref(pref) {
		try {
			if (this.service.prefHasUserValue(pref))
				return true;
			if (this.service.getBoolPref(pref))
				return true;
		} catch (e) { return false; }
		return false;
	},

	getBoolPref_CW: function getBoolPref_CW(p) {
		let ans;
		try {
			ans = this.service.getBoolPref(this.pref_base + p);
		} catch (ex) {
			throw (ex);
		}
		return ans;
	},

	getBoolPref: function getBoolPref(p) {
		let ans;
		try {
			ans = this.service.getBoolPref(p);
		} catch (ex) {
			// throw(ex);
			return false;
		}
		return ans;
	},

	setBoolPref_CW: function setBoolPref_CW(p, v) {
		return this.service.setBoolPref(this.pref_base + p, v);
	},

	setBoolPref: function setBoolPref(p, v) {
		return this.service.setBoolPref(p, v);
	},

	getCharPref_CW: function getCharPref_CW(p) {
		return this.service.getCharPref(this.pref_base + p);
	},

	getCharPref: function getCharPref(p) {
		return this.service.getCharPref(p);
	},

	setCharPref_CW: function setCharPref_CW(p, v) {
		return this.service.setCharPref(this.pref_base + p, v);
	},

	setCharPref: function setCharPref(p, v) {
		return this.service.setCharPref(p, v);
	},

	getIntPref_CW: function getIntPref_CW(p) {
		return this.service.getIntPref(this.pref_base + p);
	},

	getIntPref: function getIntPref(p) {
		return this.service.getIntPref(p);
	},

	setIntPref_CW: function setIntPref_CW(p, v) {
		return this.service.setIntPref(this.pref_base + p, v);
	},

	setIntPref: function setIntPref(p, v) {
		return this.service.setIntPref(p, v);
	},

};
