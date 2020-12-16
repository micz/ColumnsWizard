// messengerOL - overlay loader for messenger.xul - Source: mzcw-overlay.xul

// Load all scripts from original overlay file - creates common scope
// onLoad() installs each overlay xul fragment
// Menus - Folder, messages, Tools

var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');

function onLoad() {


	Services.scriptloader.loadSubScript("chrome://columnswizard/content/mzcw-overlay.js", window);
	Services.scriptloader.loadSubScript("chrome://columnswizard/content/mzcw-customcolumns.js", window);
	Services.scriptloader.loadSubScript("chrome://columnswizard/content/mzcw-prefobserver.js", window);
	Services.scriptloader.loadSubScript("chrome://columnswizard/content/mzcw-folderlistener.js", window);

	console.debug('ad menu system');

	WL.injectElements(`
<menupopup id="messageMenuPopup">
	<menu label="&ColumnsWizard.MenuLabel;" hidden="true" id="cw_edit_main_menu"
	class="menu-iconic" image="chrome://columnswizard/content/ico/mzcw-email-edit-icon.png"
	insertafter="menu_editMsgAsNew">
		 <observes element="menu_editMsgAsNew" attribute="disabled" />
		<menupopup id="cw_edit_main_menu_popup">
	    </menupopup>
	</menu>
</menupopup>
`, ["chrome://columnswizard/locale/overlay.dtd"]);

	WL.injectElements(`
<menupopup id="mailContext">
	<menu label="&ColumnsWizard.MenuLabel;" hidden="true" id="cw_edit_context_menu"
	 class="menu-iconic" image="chrome://columnswizard/content/ico/mzcw-email-edit-icon.png"
	 insertafter="mailContext-editAsNew">
		 <observes element="mailContext-editAsNew" attribute="disabled" />
		<menupopup id="cw_edit_context_menu_popup">
	    </menupopup>
	</menu>
</menupopup>
`, ["chrome://columnswizard/locale/overlay.dtd"]);


	WL.injectElements(`
<menupopup id="taskPopup">
	<menu label="&ColumnsWizard.MenuLabel;" hidden="true" id="cw_edit_newmain_menu"
	class="menu-iconic" image="chrome://columnswizard/skin/ico/mzcw-email-edit-icon.png"
	insertafter="appmenu_editMsgAsNew">
		 <observes element="appmenu_editMsgAsNew" attribute="disabled" />
		<menupopup id="cw_edit_newmain_menu_popup">
	    </menupopup>
	</menu>
</menupopup>
`, ["chrome://columnswizard/locale/overlay.dtd"]);

	WL.injectElements(`
<toolbarpalette id="MailToolbarPalette">
  <toolbarbutton id="mzcw-button"/>
  </toolbarpalette>

<toolbarpalette id="MailToolbarPalette">
	<toolbarbutton id="mzcw-button"
	  label="&ColumnsWizard.button.label;"
	  tooltiptext="&ColumnsWizard.button.tooltip;"
	  oncommand="miczColumnsWizard.openSettingsTab();"
	  class="toolbarbutton-1"/>
</toolbarpalette>
`, ["chrome://columnswizard/locale/overlay.dtd"]);

	WL.injectCSS("chrome://columnswizard/content/mzcw-overlay.css");
	WL.injectCSS("chrome://columnswizard/content/mzcw-button.css");

	window.miczColumnsWizard.init();
	// window.addEventListener("unload", miczColumnsWizard.shutdown, false);

}

function onUnload(shutdown) {
	Services.console.logStringMessage("onUnload messenger");
	let url = "chrome://columnswizard/content/settings.html";
	let tabmail = window.document.getElementById("tabmail");
	console.debug('unloading');
	console.debug(tabmail.tabInfo);
	var tabNode = null;
	tabmail.tabInfo.forEach(tab => {
		console.debug('scan	t ' + tab.tabNode + '  ' + tab.browser.contentDocument.URL);
		if (tab.browser.contentDocument.URL === url) {
			tabNode = tab.tabNode;
		}
	});

	if (tabNode) {
		console.debug('would CloseI	t ');
		// tabmail.selectTabByIndex(tabNode);
		tabmail.closeTab(tabNode);
		// tabmail.closeTab(tabNode, true);
		console.debug(tabmail.tabInfo);
		tabmail.closeTab(tabNode)
	}

}