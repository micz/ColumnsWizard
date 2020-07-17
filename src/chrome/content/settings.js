/* List.js is required to make this table work. */

"use strict";

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
var { miczColumnsWizardPref_CustomColsGrid } = ChromeUtils.import("chrome://columnswizard/content/mzcw-customcolsgrid.jsm");
var { miczColumnsWizardPref_DefaultColsGrid } = ChromeUtils.import("chrome://columnswizard/content/mzcw-defaultcolsgrid.jsm");
var { miczColumnsWizardPrefsUtils } = ChromeUtils.import("chrome://columnswizard/content/mzcw-prefsutils.jsm");

// var miczColumnsWizard = window.opener.miczColumnsWizard;
var miczColumnsWizard = window.miczColumnsWizard;
var miczColumnsWizardPref2 = {


	htmlToElements: function (html) {
		var domParser = new DOMParser();
		domParser.forceEnableXULXBL();
		var docFragment = domParser.parseFromString(html, 'text/html');
		console.debug(docFragment.body.firstChild.outerHTML);
		return docFragment.body.firstChild;
	},

	settingsLoad: function () {

		// var e = document.getElementById("test");
		// var e2 = document.getElementById("test2");
		
		// e.appendChild(miczColumnsWizardPref2.htmlToElements('<input type="checkbox">'));
		// e.appendChild(miczColumnsWizardPref2.htmlToElements('<img src="chrome://columnswizard/content/i/arrow-up-black-64px.png" height="16px" width="16px" class="arrows down-action">'));
		// e2.appendChild(miczColumnsWizardPref2.htmlToElements('<img src="chrome://icons/resource/arrow-down-black-64px.png" height="16px" width="16px" class="arrows down-action">'));
		// e.appendChild(miczColumnsWizardPref2.htmlToElements('<img src="arrow-down-black-64px.png" height="16px" width="16px" class="arrows down-action">'));

		// var html = '<img src="arrow-down-black-64px.png" height="16px" width="16px" class="arrows down-action">';
		// e2.innerHTML = '<img src="arrow-down-black-64px.png" height="16px" width="16px" class="arrows down-action">';
		// console.debug(e.outerHTML);

		// var parser = new DOMParser();
		// parser.forceEnableXULXBL();
		// var docFragment2 = parser.parseFromString(html, 'text/html');
		// console.debug(docFragment2.body.firstChild.outerHTML);
		// // e2.appendChild(docFragment2.body.firstChild);
		// var i = docFragment2.body.firstChild.outerHTML;
		// e.innerHTML = i;

		// return;

		var options = {
			//   valueNames: [ { data: ['date'] }, { data: ['description'] }, { data: ['yearly']} ],
			valueNames: ['show1', 'sort_by1', 'name', 'move_up', 'move_down',
				{ data: ['id'] },
				{ name: 'show', attr: 'checked' },
				{ name: 'sort_by', attr: 'checked' },
			],
			item: '<tr class="list-row id" >\
			<td>\
				<label class="container">\
					<input type="checkbox" class="show">\
					<span class="checkmark"></span>\
					</label>\
			</td>\
			<td >\
			<label class="container">\
					<input type="radio" class="sort_by" name="sortRadioGroup">\
					<span class="rcheckmark"></span>\
					</label>\
			</td>\
			<td class="name"></td>\
			<td class="move_up up-action" >\
			</td>\
			<td class="move_down down-action">\
			</td>\
			</tr>',

		};

		// <img src="./arrow-down-black-64px.png" height="16px" width="16px" class="arrows down-action">\

		
		console.debug('Start');
		// var tableList = new List('tableID',  {plugins: ListController()});
 		var tableList = new List('tableID', options);

		var lst = document.getElementById('defaultColTable');
		lst.addEventListener('click', onRowClick);
		// lst.addEventListener('keydown', onKey);

		tableList.controller = new ListController(tableList);

		var index = 1;

		var defaultCols = miczColumnsWizardPref2.loadDefaultColRows_Pref();
		let sortcolindex = miczColumnsWizardPrefsUtils.getIntPref("mailnews.default_sort_type");
		
		
		console.debug(defaultCols);
		var sb;

		for (const colId in defaultCols) {
			if (defaultCols.hasOwnProperty(colId)) {
				const element = defaultCols[colId];
				if (sortcolindex === miczColumnsWizardPref_DefaultColsGrid.getSortType(element.currindex)) {
					// col_sortby.setAttribute("selected", true);
					sb = true;
				} else {
					sb = false;
				}
				// console.debug(colId);
				console.debug( element );
				// console.debug( element.visible );
				// console.debug( element.sort_by);
				// let sb = element.sort_by ? "true" : "false";
				// console.debug(sb);
				tableList.add({
					show: element.visible,
					sort_by: sb,
					name: colId,
					move_up: '<img src="chrome://columnswizard/content/ico/arrow-up-black-64px.png" height="16px" width="16px" class="arrows down-action">',
					move_down: '<img src="chrome://columnswizard/content/ico/arrow-down-black-64px.png" height="16px" width="16px" class="arrows down-action">',
					id: index++,
				});


			}
		}

		// console.debug(lst.outerHTML);

		// let uncheckedItems = document.querySelectorAll('[checked="false"]');
		// for (const element of uncheckedItems) {
		// 	element.removeAttribute("checked");
		// }


		let checkedItems = document.querySelectorAll('[checked]');
		for (const element of checkedItems) {
			console.debug(element);
			if (element.getAttribute("checked") === "false") {
				element.removeAttribute("checked");
			} else {
				element.checked = true;
			}
		}

		// console.debug(lst.outerHTML);


		// function onRowClick(obj, offset) {
		function onRowClick(event, offset) {
			console.debug(event);
			console.debug(event.target.outerHTML);
			console.debug(event.target.cellIndex);
			console.debug(event.target.parentElement.outerHTML);

			if (event.target.classList.contains('up-action')) {
				console.debug('MoveUp');
				move(event, 1);
				
			} else if (event.target.classList.contains('down-action')) {
				move(event, -1);
			}
		}

		function move(event, offset) {
			console.debug('MoveObject  ' + offset);
			// console.debug(obj);
			// console.debug(event.target.outerHTML);
			// console.debug(event.currentTarget.outerHTML);
			var listElement = lst;
			console.debug('ListLinks');
			// console.debug(lst.rows );
			// console.debug(lst.rows.length );
			// console.debug(obj.parent);
			// console.debug(obj.parent.outerHTML);
			// let row = event.currentTarget.parentElement.getAttribute("data-id");
			var selector = 'tr';
			var row = event.target.closest(selector);
			
			console.debug(row.getAttribute("data-id"));
			tableList.controller.selectRowByDataId(row.getAttribute("data-id"));

			var selectedID = tableList.controller.getSelectedRowDataId();

			console.debug('SelectedId ' + selectedID);
			console.debug(listElement.rows.length - 1);
			// 1 === up
			if (selectedID === '1' && offset > 0) {
				console.debug('top');
			}

			if (selectedID === '1' && offset > 0 || Number(selectedID) === listElement.rows.length - 1 && offset < 0) {
				return;
			}


			var selectedElement = tableList.controller.getSelectedRowElement();
			console.debug(selectedElement);
			var swapElement;
			if (offset === 1) {
				swapElement = selectedElement.previousElementSibling;
				console.debug('offset1');

			} else {
				swapElement = selectedElement.nextElementSibling;
			}

			console.debug(swapElement);
			selectedElement.remove();
			tableList.reIndex();
			console.debug('still, the removed ');
			if (offset === 1) {
				console.debug(listElement.outerHTML);
				console.debug(selectedElement);
				// listElement.insertBefore(selectedElement, swapElement);
				// listElement.insertBefore(selectedElement, null);
				swapElement.before(selectedElement);
			} else {
				swapElement.parentNode.insertBefore(selectedElement, swapElement.nextSibling);
			}
			tableList.reIndex();
			selectedElement.setAttribute("data-id", selectedID - 1);
			swapElement.setAttribute("data-id", selectedID + 1);
			tableList.controller.selectRowByDataId(selectedID - 1);
		}

	},

	// cleidigh list functions

	loadDefaultColRows_Pref: function () {
		// let prefsc = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
		// let prefs = prefsc.getBranch("extensions.ColumnsWizard.");
		// let DefaultColIndexStr=prefs.getCharPref("DefaultColsList");
		let DefaultColIndexStr = miczColumnsWizardPrefsUtils.getCharPref_CW("DefaultColsList");
		// console.debug(`CurrentIndexS: ${DefaultColIndexStr}`);
		let loadedDefaultColIndex = [];
		if (DefaultColIndexStr === '') {
			// Set default cols if none set at the moment
			loadedDefaultColIndex = miczColumnsWizardPref_DefaultColsGrid.getOriginalColIndex();
			// console.debug(`D IndexS: ${DefaultColIndexStr}`);
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] default loaded and saved pref\r\n");
		} else {
			loadedDefaultColIndex = JSON.parse(DefaultColIndexStr);
			// console.debug(`L IndexS: ${loadedDefaultColIndex}`); 
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] pref loaded\r\n");
		}
		// fix wrong ordina values: columns must have odd ordinal values, because even values are for splitters (used for columns resizing)
		loadedDefaultColIndex = miczColumnsWizardPref_DefaultColsGrid.fixOrdinalValues(loadedDefaultColIndex);
		// check if there are new columns to add
		let baseColumnStates = miczColumnsWizardPref_DefaultColsGrid.getOriginalColIndex();
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid] baseColumnState "+JSON.stringify(baseColumnStates)+"\r\n");
		if (Object.keys(baseColumnStates).length !== Object.keys(loadedDefaultColIndex).length) { // if the length are different so check the column to add
			// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] different lengths\r\n");
			for (let key in baseColumnStates) {
				if (!loadedDefaultColIndex.hasOwnProperty(key)) {
					loadedDefaultColIndex[key] = baseColumnStates[key];
					// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] key not found "+key+"\r\n");
				}
			}
		}
		miczColumnsWizardPrefsUtils.setCharPref_CW("DefaultColsList", JSON.stringify(loadedDefaultColIndex));
		// dump(">>>>>>>>>>>>> miczColumnsWizard: [miczColumnsWizardPref_DefaultColsGrid loadDefaultColRows_Pref] "+JSON.stringify(loadedDefaultColIndex)+"\r\n");
		return loadedDefaultColIndex;
	},

};



window.addEventListener("load", miczColumnsWizardPref2.settingsLoad, false);
