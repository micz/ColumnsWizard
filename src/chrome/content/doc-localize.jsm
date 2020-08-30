var EXPORTED_SYMBOLS = ["DocLocalize"];

// if (!Services) {
// var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
// }

var { OS } = ChromeUtils.import("resource://gre/modules/osfile.jsm");
var { miczLogger } = ChromeUtils.import("resource://columnswizard/miczLogger.jsm");

const localesRootDir = "_locales";
var supportedLocales = ['de', 'en-US', 'nl', 'fr', 'it', 'zh-CN', 'ja', 'es-ES', 'ru', 'hu-HU', 'hy-AM', 'ko-KR',
						'el', 'pl', 'da', 'pt-PT'];

// var supportedLocales = ['ca', 'da', 'de', 'en-US', 'es-ES', 'fr', 'gl-ES', 'hu-HU', 'hy-AM',
// 		'it', 'ja', 'ko-KR', 'nl', 'pl', 'pt-PT', 'ru', 'sk-SK', 'sl-SI', 'sv-SE', 'zh-CN', 'el'];

var document;
const keyPrefix = "__MSG_";
var messages = {};

var DocLocalize = {

	determineLocale: function () {
		var tb_locale = Services.locale.appLocaleAsBCP47;
		miczLogger.log('ThunderbirdLocale ' + tb_locale);

		var supportedLocaleRegions = supportedLocales.filter(l => {
			if (l === tb_locale || l.split('-')[0] === tb_locale.split('-')[0]) {
				return true;
			}
			return false;
		});

		var localeDir = "en-US";

		miczLogger.log('SupportedRegions ' + supportedLocaleRegions);
		if (!supportedLocaleRegions.length) {
			return localeDir;
		} else if (supportedLocaleRegions.includes(tb_locale)) {
			return tb_locale;
		} else if (supportedLocaleRegions.length === 1) {
			return supportedLocaleRegions[0];
		} else if (supportedLocaleRegions.indexOf(tb_locale.split('-')[0]) !== -1) {
			return tb_locale.split('-')[0];
		}
	},

	loadLocaleMessages: async function (doc, file) {
		document = doc;
		var messages;
		var localeDir = this.determineLocale();
		miczLogger.log('Using Locale: ' + localeDir);


		let messageFile = `${localeDir}/${file}`;
		try {
			await DocLocalize.loadMessageFile(messageFile);
		} catch (e) {
			console.debug(e);
		}
		// console.debug(messages);
	},


	loadMessageFile: async function (file) {
		// let url = '';
		let url = `chrome://cwrl2/content/${file}`;
		var j = "";
		let request = new XMLHttpRequest();
		request.responseType = "text";

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
		// console.debug('Localize');
		await DocLocalize.updateDocument(messages);
		return;

	},

	updateString: function (string) {
		let re = new RegExp(keyPrefix + "(.+?)__", "g");
		return string.replace(re, matched => {
			const key = matched.slice(keyPrefix.length, -2);
			// console.debug(key);

			if (messages[key]) {
				// console.debug(messages[key].message);
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
			// console.debug(attribute.value);
			if (attribute.value.includes(keyPrefix)) attribute.value = this.updateString(attribute.value);
		}
	},

	updateDocument: async function () {
		DocLocalize.updateSubtree(document);
	},
};

