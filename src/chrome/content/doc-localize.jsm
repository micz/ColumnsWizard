var EXPORTED_SYMBOLS = ["DocLocalize"];

// if (!Services) {
// var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
// }

var { OS } = ChromeUtils.import("resource://gre/modules/osfile.jsm");

const localesRootDir = "_locales";
var supportedLocales = ['de', 'en-US', 'nl', 'fr', 'it', 'zh-CN', 'ja'];

var document;
const keyPrefix = "__MSG_";
var messages = {};

var DocLocalize = {

	determineLocale: function () {
		var tb_locale = Services.locale.appLocaleAsBCP47;

		var supportedLocaleRegions = supportedLocales.filter(l => {
			if (l === tb_locale || l.split('-')[0] === tb_locale.split('-')[0]) {
				return true;
			}
			return false;
		});

		var localeDir = "en-US";

		if (!supportedLocaleRegions.length) {
			return localeDir;
		} else if (supportedLocaleRegions.includes(tb_locale)) {
			return tb_locale;
		} else if (supportedLocaleRegions.indexOf(tb_locale.split('-')[0]) !== -1) {
			return tb_locale.split('-')[0];
		}
	},

	loadLocaleMessages: async function (doc, file) {
		document = doc;
		var messages;
		var localeDir = this.determineLocale();
		console.debug(localeDir);


		let messageFile = `${localeDir}/${file}`;
		try {
			// messages = await OS.File.read(messageFile, {encoding: 'utf-8'});
			// messages = await OS.File.read("settings.json", {encoding: 'utf-8'});
			var i18n = {};
			// Services.scriptloader.loadSubScript("chrome://columnswizard/content/settings.json", msgContext);
			// Services.scriptloader.loadSubScript("chrome://columnswizard/content/modules/i18n.js", i18n);
			await DocLocalize.loadMessageFile(messageFile);
		} catch (e) {
			console.debug(e);
		}
		console.debug(messages);
	},


	loadMessageFile: async function (file) {
		// let url = '';
		let url = `chrome://cwrl2/content/${file}`;
		var j = "";
		let request = new XMLHttpRequest();
		request.responseType = "text";
		console.debug('load file');

		request.open("GET", url);
		request.send();
		return new Promise(resolve => {
			request.addEventListener("load", function () {
				j = this.responseText;
				let j2 = JSON.parse(j);
				DocLocalize.localizeDoc(j2);
				resolve();
			});
		});

	},

	localizeDoc: async function (msgs) {
		messages = msgs;
		console.debug('Localize');
		await DocLocalize.updateDocument(messages);
		return;

		var docStrings;

		const stringPattern = /__MSG_([a-zA-Z0._\-]+__)/g

		var stringPattern2 = /__MSG_([a-zA-Z0._\-]+)__/g
		docStrings = [...document.documentElement.outerHTML.matchAll(stringPattern2)];
		console.debug(docStrings);
		// console.debug(document.body.outerHTML);

		var docElements = Array.from(document.body.getElementsByTagName("*"));

		docStrings.forEach(str => {
			console.debug(str);
			let localizedString = messages[str[1]].message;
			console.debug(localizedString);
			docElements.forEach(element => {
				if (element.textContent && element.textContent.includes(str[0])) {
					let text = element.textContent;
					text.replace(str[0], localizedString);
					console.debug(text);
					element.textContent = text;
				}

			});
		});
		console.debug(docStrings);
	},

	updateString: function (string) {
		let re = new RegExp(keyPrefix + "(.+?)__", "g");
		return string.replace(re, matched => {
			const key = matched.slice(keyPrefix.length, -2);
			// return extension.localeData.localizeMessage(key);
			// return messenger.i18n.getMessage(key) || matched;
			console.debug(key);

			if (messages[key]) {
				console.debug(messages[key].message);
				return messages[key].message;
			}
			return matched;
		});
	},

	updateSubtree: function (node) {
		const texts = document.evaluate(
			'descendant::text()[contains(self::text(), "' + keyPrefix + '")]',
			node,
			null,
			XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
			null
		);
		for (let i = 0, maxi = texts.snapshotLength; i < maxi; i++) {
			const text = texts.snapshotItem(i);
			if (text.nodeValue.includes(keyPrefix)) text.nodeValue = this.updateString(text.nodeValue);
		}

		const attributes = document.evaluate(
			'descendant::*/attribute::*[contains(., "' + keyPrefix + '")]',
			node,
			null,
			XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
			null
		);
		for (let i = 0, maxi = attributes.snapshotLength; i < maxi; i++) {
			const attribute = attributes.snapshotItem(i);
			console.debug(attribute.value);
			if (attribute.value.includes(keyPrefix)) attribute.value = this.updateString(attribute.value);
		}
	},

	updateDocument: async function () {
		DocLocalize.updateSubtree(document);
	},
};

	// document.addEventListener('DOMContentLoaded', () => {
	// 	localization.updateDocument();
	// }, { once: true });

// window.addEventListener('DOMContentLoaded', (event) => {
// 	console.log('DOM fully loaded and parsed');

// 	loadLocaleMessages(localesRootDir + "\\en-US", "settings.json");
// });