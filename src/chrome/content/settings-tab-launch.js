console.debug('Open Settings in Tab(no address bar)');
let windowManager = Cc['@mozilla.org/appshell/window-mediator;1']
		.getService(Ci.nsIWindowMediator),
win3pane = windowManager.getMostRecentWindow("mail:3pane");

let url = "chrome://columnswizard/content/settings.html";
win3pane.openTab("chromeTab", { chromePage: url });
// Close hidden launch window
window.close();
