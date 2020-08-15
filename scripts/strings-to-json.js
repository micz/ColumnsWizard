const fs = require('fs-extra');
var parser = require("dtd-file");

const localeDir = "../src/chrome/locale";
const referenceLocaleId = "en-US";

const dtdTestFile = "de/settings.dtd";
const propertyTestFile = "en-US/settings.properties";
const propertyTestFile2 = "de/settings.properties";
const jsonTestFileOut = "../src/_locales/de/settings";
const jsonTestFileOut3 = "../src/_locales/de/settings2";
const jsonTestFileOut2 = "../src/_locales/en-US/settings2";

var keyName = "";
var msg = "";

var templates = {
	tbMessageJson: {
		ext: "json",
		tmp: `"${keyName}":\n\t"message": ${msg}`,
	},
}

function loadPropertys(propertyFile) {
	let propertiesText = fs.readFileSync(propertyFile, 'utf-8');
	console.debug(propertiesText);
	const rg = /^(.+)=(.+)$/gm;
	let properties = Array.from(propertiesText.matchAll(rg));
	// console.debug(properties);
	let propertyStrings = properties.map(p => {
		// return {`"${p[1]}": "${p[2]}"`});
		let key = p[1];
		let str = p[2];
		return { [key]: str };
		// return { `"${p[1]}"`: "a"};
	});
	// console.debug(propertyStrings);
	return propertyStrings;
}

function loadDTD(dtdFile) {
	let fileEntitiesKeys = Object.keys(parser.parse(fs.readFileSync(dtdFile, 'utf-8')));
	let fileEntities = parser.parse(fs.readFileSync(dtdFile, 'utf-8'));
	// console.debug(fileEntities);

	return fileEntities;

}

function srcItemsToMessageJson(fileEntities, outputFile, options) {
	// var itemTemplate = options.template.tmp;

	var outputMessages = "{\n";

	if (options.append) {
		outputMessages = "\n";
	}

	var outputKeys = "";

	if (options.propertiesType) {
		fileEntities.forEach((p, i) => {
			let keyName = Object.keys(p)[0];
			let msg = p[keyName];
			let tmp = `\t"${keyName}": {\n\t\t"message": "${msg}"\n\t}`;
			outputMessages += tmp;
			if (i < fileEntities.length - 1) {
				outputMessages += ",\n";
			}
		});
		outputKeys += `__MSG_${keyName}__\n`;
	} else {
		let len = Object.keys(fileEntities).length;

		console.debug(fileEntities);
		for (const entityKey in fileEntities) {

			keyName = entityKey;
			msg = fileEntities[entityKey];
			console.debug(msg);
			let tmp = `\t"${keyName}": {\n\t\t"message": "${msg}"\n\t}`;
			outputMessages += tmp;
			if (Object.keys(fileEntities).indexOf(entityKey) !== len - 1) {
				outputMessages += ",\n";
			}
			// console.debug(tmp);
			outputKeys += `__MSG_${entityKey}__\n`;

		}
	}

	if (options.append) {
		outputMessages = "\n";
	}

	outputMessages += "\n}\n";

	console.debug(outputMessages);
	console.debug(outputFile);
	// console.debug(JSON.stringify(outputMessages));
	fs.writeFileSync(outputFile + ".json", outputMessages);
	fs.writeFileSync(outputFile + ".txt", outputKeys);
}
const test1FilePath = `${localeDir}/${dtdTestFile}`;
// const test1FilePath2 = `${localeDir}/${propertyTestFile}`;
const test1FilePath2 = `${localeDir}/${propertyTestFile2}`;

function testDtoJ(inputFile, outputFile) {
	let entities = loadDTD(inputFile);
	let options = {};
	options.append = false;
	options.propertiesType = false;
	srcItemsToMessageJson(entities, outputFile, options);
}

function testPtoJ(inputFile, outputFile) {
	let entities = loadPropertys(inputFile);
	let options = {};
	options.append = false;
	options.propertiesType = true;
	srcItemsToMessageJson(entities, outputFile, options);
}

// testDtoJ();
// let inputFile =  `${localeDir}/de/overlay.properties`;
// let outputFile = "../src/_locales/de/messages-out";

let inputFile =  `${localeDir}/en-US/overlay.dtd`;
let outputFile = "../src/_locales/en-US/messages-out";

// let inputFile =  `${localeDir}/de/overlay.dtd`;
// let outputFile = "../src/_locales/de/messages-out";

// testPtoJ(inputFile, outputFile);
testDtoJ(inputFile, outputFile);
