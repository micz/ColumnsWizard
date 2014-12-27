"use strict";
/**
 * @constructor
 *
 * @param {string} branch_name
 * @param {Function} callback must have the following arguments:
 *   branch, pref_leaf_name
 */
miczColumnsWizard.PrefListener = function (branch_name, callback) {
  // Keeping a reference to the observed preference branch or it will get
  // garbage collected.
  var prefService = Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService);
  this._branch = prefService.getBranch(branch_name);
  this._branch.QueryInterface(Components.interfaces.nsIPrefBranch);
  this._callback = callback;
}

miczColumnsWizard.PrefListener.prototype.observe = function(subject, topic, data) {
  if (topic == 'nsPref:changed')
    this._callback(this._branch, data);
};

/**
 * @param {boolean=} trigger if true triggers the registered function
 *   on registration, that is, when this method is called.
 */
miczColumnsWizard.PrefListener.prototype.register = function(trigger) {
  this._branch.addObserver('', this, false);
  if (trigger) {
    let that = this;
    this._branch.getChildList('', {}).
      forEach(function (pref_leaf_name)
        { that._callback(that._branch, pref_leaf_name); });
  }
};

miczColumnsWizard.PrefListener.prototype.unregister = function() {
  if (this._branch)
    this._branch.removeObserver('', this);
};

//TODO

//Adding preferences listener
miczColumnsWizard.CWListener = new miczColumnsWizard.PrefListener(
  "extensions.ColumnsWizard.CustCols.",
  function(branch, name) {//dump("PrefListener call: "+name+"= "+branch.getBoolPref(name)+"\n\r");
    var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
    //with the pref name AddCOLNAME, get the COLNAME all lowercase!!
    let cwColName=name.substr(3).toLowerCase();
    let cwCustColPref=miczColumnsWizard.loadCustCols();
    //dump(">>>>>>>>>>>>> miczColumnsWizard.PrefListener: [PrefName|cwColName] "+name+"|"+cwColName+"\r\n");
    if(branch.getBoolPref(name)){
      //checbox checked
      miczColumnsWizard.CustCols.addCustomColumn(cwCustColPref[cwColName],ObserverService);
      if(cwCustColPref[cwColName].iscustom!=false){
        miczColumnsWizard.activateCustomDBHeader(cwCustColPref[cwColName].DBHeader);
      }
    }else{
      //checbox not checked
      miczColumnsWizard.CustCols.removeCustomColumn(cwColName,ObserverService);
      /*if(cwCustColPref[cwColName].iscustom!=false){
        miczColumnsWizard.deactivateCustomDBHeader(cwCustColPref[cwColName].DBHeader);
      }*/
    }
  }
);
miczColumnsWizard.CWListener.register(false);
