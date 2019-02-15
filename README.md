# ![ColumnsWizard icon](rep-resources/images/mzcw-icon.png "ColumnsWizard")  ColumnsWizard

ColumnsWizard is a Thunderbird addon that adds some magic to the folder list columns.
With this addon you can:
  * Add a custom column directly from the addon preference window to show any mail header you want.
  * Define the default columns settings for any new folder.
  * Show hidden columns in the Conversation Tab and in the search window.
  * Edit a mail header value for a single message.

This add-on is the original work of Micz and with his permission I will be updating
the code for compatibility going forward and possible improvements.

Update for TB60 in progress...

![ColumnsWizard_version](https://img.shields.io/badge/version-v6.1-darkorange.png?label=ColumnsWizard)
![ColumnsWizard_tb_version](https://img.shields.io/badge/version-v6.1-blue.png?label=Thunderbird%20Add-On)
![Thunderbird_version](https://img.shields.io/badge/version-v38.0_--_58.*-blue.png?label=Thunderbird)
[![License: GPL v3](https://img.shields.io/badge/GPL%20v3-red.png)](src/LICENSE)
#

## ColumnsWizard Add-On Installation

Normal install from Thunderbird Add-On site:
- Download and install from the add-on menu
- Within Thunderbird ``Tools\Add-ons`` search for 'ColumnsWizard' install and reload.

Install XPI directly:
- Download desired version package from the [XPI](xpi) folder.
- Within Thunderbird ``Tools\Add-ons`` click the gear icon and choose ``Install Add-ons From File..``
- Choose XPI file, install and reload.

## XPI Add-On Package Build instructions

1. Make sure that you have [jpm](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm#Installation) tool installed.
2. Open a terminal in the repository root dir
3. Run ``./scripts/build-xpi.bat`` to make the xpi

Notes : 
- ``jpm xpi`` adds ``bootstrap.js`` to the src directory, this is deleted as a post-build step: 
- A ``manifest.json`` file is also introduced for testing in TB60+.

## Issues & Questions
Post any issues or questions for ColumnsWizard under [Issues](https://github.com/cleidigh/ColumnsWizard/issues)

## Changelog
ColumnsWizard's changes are logged [here](CHANGELOG.md).

## Credits
Original Author: [Micz](https://addons.thunderbird.net/en-US/thunderbird/user/Micz/ "Micz")

