const fs = require('fs');

const localeDir = "./src/chrome/locale";
const referenceLocaleId = "en-US";

loadLocales = function (localeDir, referenceLocale, localeIds) {

	// GetLocaleFiles
	const localeFolders = _getAllFilesOrFolders(localeDir, true);

	if (localeFolders.indexOf(referenceLocale) === -1 ) {
		return [];
	}

	let locales = [];

	localeFolders.forEach( (localeFolder, index) => {
		locales.push({localeId: localeFolder, localePath: `${localeDir}/${localeFolder}`, referenceLocale: ((localeFolder === referenceLocale) ? true : false)});
		let localeFiles = _getAllFilesOrFolders(`${localeDir}/${localeFolder}`, false);

		locales[index].localeFiles = localeFiles;
		locales[index].missingFiles = [];
		locales[index].missingEntities = [];
		locales[index].extraEntities = [];

	});

	// console.log(locales);

	// console.log(locales[0]);
	return locales;
};


var _getAllFilesOrFolders = function (dir, foldersOnly) {

	var filesystem = require("fs");
	var files = [];
	var folders = [];

	filesystem.readdirSync(dir).forEach(function (fileObj) {

		file = dir + '/' + fileObj;
		var stat = filesystem.statSync(file);

		if (stat && stat.isDirectory()) {
			// results = results.concat(_getAllFilesFromFolder(file));
			folders.push(fileObj);
		} else files.push(fileObj);
	});

	if (foldersOnly) {
		return folders;
	} else {
		return files;
	}
	return results;

};

compareLocaleEntities = function(locales, referenceLocaleId, localeSet) {
	
	// const refIndex = localeFolders.indexOf(referenceLocale);

	const refIndex = 1;
	if (refIndex === -1) {
		return 1;
	}
	
	locales.forEach( (locale, index) => {
		if (index  === refIndex) {
			// Skip reference locale
			return;
		}

		locales[refIndex].localeFiles.forEach( file => {
			if (locale.localeFiles.indexOf(file) === -1) {
				console.log(`File Missing (${locale.localeId}) ${file}`);
				locale.missingFiles.push(file);
				return;
			} else {
				if (file.substr(-4).toLowerCase() === '.dtd' ) {
					console.log(`Processing DTD: (${locale.localeId}) ${file}`);
					const results = compareDTDFiles(`${locales[refIndex].localePath}/${file}`,`${locale.localePath}/${file}`);
					locale.missingEntities = locale.missingEntities.concat(results.missingEntities);
					locale.extraEntities = locale.extraEntities.concat(results.extraEntities);
				} else if (file.substr(-11).toLowerCase() === '.properties'   ){
					console.log(`Processing Properties: (${locale.localeId}) ${file}`);
					const results = comparePropertyFiles(`${locales[refIndex].localePath}/${file}`,`${locale.localePath}/${file}`);
					locale.missingEntities = locale.missingEntities.concat(results.missingEntities);
					locale.extraEntities = locale.extraEntities.concat(results.extraEntities);
				}
			}
		});
		
	});


};

compareDTDFiles = function (referenceFile, comparisonFile) {
	var parser = require("dtd-file");

	console.log(referenceFile+'  '+comparisonFile);
	let refEntities =  Object.keys(parser.parse(fs.readFileSync(referenceFile, 'utf-8')));
	let compEntities =  Object.keys(parser.parse(fs.readFileSync(comparisonFile, 'utf-8')));

	let missingEntities = [];

	refEntities.forEach(entityKey => {
		// console.log('Key: '+entityKey);
		const i = compEntities.indexOf(entityKey);
		// console.log(i);
		if (i !== -1) {
			compEntities.splice(i, 1);
		} else {
			missingEntities.push(`${comparisonFile}$${entityKey}`);
			console.log(`Missing element: ${entityKey}`);
		}
	});

	return { missingEntities: missingEntities, extraEntities: compEntities };
};



comparePropertyFiles = function (referenceFile, comparisonFile) {

	console.log(referenceFile+'  '+comparisonFile);
	let refProperties =  fs.readFileSync(referenceFile, 'utf-8').split('\n').map(l => l.split('=')[0]);
	let compProperties = fs.readFileSync(comparisonFile, 'utf-8').split('\n').map(l => l.split('=')[0]);;

	console.log(compProperties);

	let missingEntities = [];

	refProperties.forEach(property => {
		// const property = propertyLine.split('=')[0];
		
		// console.log('Property: '+ property);

		const i = compProperties.indexOf(property);
		// console.log(i);
		if (i !== -1) {
			compProperties.splice(i, 1);
		} else {
			missingEntities.push(`${comparisonFile}$${property}`);
			console.log(`Missing element: ${property}`);
		}
	});

	return { missingEntities: missingEntities, extraEntities: compProperties };
};

compareDTDEntities = function (referenceSet, comparisonSet) {

	let extraEntities = [];
	let missingEntities = [];

	referenceSet.forEach(entityKey => {
		// console.log('Key: '+entityKey);
		const i = comparisonSet.indexOf(entityKey);
		console.log(i);
		if (i !== -1) {
			comparisonSet.splice(i, 1);
		} else {
			missingEntities.push(entityKey);
			console.log(`Missing element: ${entityKey}`);
		}
	});

	// console.log(comparisonSet);	
	// console.log(missingEntities);
	return { missingEntities: missingEntities, extraEntities: comparisonSet };
};

// Reading data in utf-8 format 
// which is a type of character set. 
// Instead of 'utf-8' it can be 
// other character set also like 'ascii' 
// fs.readFileSync('./src/chrome/locale/en-US/mzcw-settings-customcolseditor.dtd', 'utf-8', (err, data) => { 
let data = fs.readFileSync('./src/chrome/locale/en-US/mzcw-settings-customcolseditor.dtd', 'utf-8');
let data2 = fs.readFileSync('./src/chrome/locale/nl/mzcw-settings-customcolseditor.dtd', 'utf-8');

// Converting Raw Buffer to text 
// data using tostring function. 
// console.log(data);

// var res = parser.parse(data);
// var res2 = parser.parse(data2);

// // console.log(res);
// let r1 = Object.keys(res);
// let r2 = Object.keys(res2);

// const results = compareDTDEntities(r1, r2);
// console.log(results.missingEntities);
// console.log(results.extraEntities);

let locales = loadLocales(localeDir, referenceLocaleId, null);
if (locales.length === 0) {
	return 1;
}

// Compare files

const localeSet = null;
// let result = compareDTDFiles(`${locales[1].localePath}/${locales[1].localeFiles[0]}`, `${locales[4].localePath}/${locales[4].localeFiles[0]}`);
let result = compareLocaleEntities(locales);
console.log(locales);
