console.debug('Open Settings in Tab(no address bar)');
let windowManager = Cc['@mozilla.org/appshell/window-mediator;1']
		.getService(Ci.nsIWindowMediator),
win3pane = windowManager.getMostRecentWindow("mail:3pane");

// let url = "chrome://columnswizard/content/settings.html";
let url = "resource://columnswizard/content/settings.html";

// cleidigh - Use contentTab 91+
// win3pane.openTab("contentTab", { chromePage: url });
// win3pane.openTab("contentTab", { url: url });
// win3pane.openTab("contentTab", { url });
win3pane.document.getElementById("tabmail").openTab("contentTab", { url });
// Close hidden launch window
window.close();
