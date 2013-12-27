/**
 * @constructor
 *
 * @param {string} branch_name
 * @param {Function} callback must have the following arguments:
 *   branch, pref_leaf_name
 */
function PrefListener(branch_name, callback) {
  // Keeping a reference to the observed preference branch or it will get
  // garbage collected.
  var prefService = Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService);
  this._branch = prefService.getBranch(branch_name);
  this._branch.QueryInterface(Components.interfaces.nsIPrefBranch);
  this._callback = callback;
}

PrefListener.prototype.observe = function(subject, topic, data) {
  if (topic == 'nsPref:changed')
    this._callback(this._branch, data);
};

/**
 * @param {boolean=} trigger if true triggers the registered function
 *   on registration, that is, when this method is called.
 */
PrefListener.prototype.register = function(trigger) {
  this._branch.addObserver('', this, false);
  if (trigger) {
    let that = this;
    this._branch.getChildList('', {}).
      forEach(function (pref_leaf_name)
        { that._callback(that._branch, pref_leaf_name); });
  }
};

PrefListener.prototype.unregister = function() {
  if (this._branch)
    this._branch.removeObserver('', this);
};


//Adding preferences listener
var CWListener = new PrefListener(
  "extensions.ColumnsWizardCustCols.",
  function(branch, name) {//dump("PrefListener call: "+name+"= "+branch.getBoolPref(name)+"\n\r");
    switch (name) {
      case "AddCc": //Cc Listener
          if(branch.getBoolPref(name)){
            //checbox checked
            miczColumnsWizardCustCols.addCustomColumn("cc");
            var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
            ObserverService.addObserver(miczColumnsWizardCustCols.CreateDbObserver_Cc, "MsgCreateDBView", false);
          }else{
            //checbox not checked
            miczColumnsWizardCustCols.removeCustomColumn("cc");
            var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
            ObserverService.removeObserver(miczColumnsWizardCustCols.CreateDbObserver_Cc, "MsgCreateDBView");
          }
      break; //Cc Listener - END
    }
  }
);
CWListener.register(true);
