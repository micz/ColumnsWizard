
function getMail3Pane() {
		let windowManager = Cc['@mozilla.org/appshell/window-mediator;1']
				.getService(Ci.nsIWindowMediator),
		    win3pane = windowManager.getMostRecentWindow("mail:3pane");
		return win3pane;
}


Services.console.logStringMessage("onUnload messenger");
	let url = "chrome://columnswizard/content/settings.html";
	let tabmail = getMail3Pane().document.getElementById("tabmail");
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
		console.debug('CloseI	t ');
		// tabmail.selectTabByIndex(tabNode);
		// tabmail.closeTab(tabNode, true);
		tabmail.closeTab(tabNode, false);
	}
