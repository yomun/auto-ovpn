/*
 * Auto OVPN gnome extension
 * https://jasonmun.blogspot.my
 * 
 * Copyright (C) 2017 Jason Mun
 *
 * Auto OVPN gnome extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Auto OVPN gnome extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Show Ip gnome extension.  If not, see <http://www.gnu.org/licenses/>.
 * 
 */

const Clutter = imports.gi.Clutter;
const Gio     = imports.gi.Gio;
const GLib    = imports.gi.GLib;
const Main    = imports.ui.main;

const Extension = imports.misc.extensionUtils.getCurrentExtension();
const PanelMenuButton = Extension.imports.button.PanelMenuButton;
const Utilities       = Extension.imports.utilities;
const Convenience     = Extension.imports.convenience;
const metadata        = Extension.metadata;
const shell_path      = Extension.path + "/sh";

const Gettext = imports.gettext.domain(Extension.metadata['gettext-domain']);
const _ = Gettext.gettext;

let directory;
let directoryMonitor;

let buttons = [];

function init() {
	// Convenience.initTranslations();
	readConfigFile();
}

function readConfigFile() {
	let directoryPath = GLib.build_filenamev([shell_path, ""]);
	directory = Gio.File.new_for_path(directoryPath);

	/*
	if (!directory.query_exists(null)) {
		directory.make_directory(null);
		
		Main.notify("HELLO ?");

		let scriptPath = GLib.build_filenamev([directoryPath, "argos.sh"]);

		let scriptContents =
			'#!/usr/bin/env bash\n\n' +
			'URL="github.com/p-e-w/argos"\n' +
			'DIR=$(dirname "$0")\n\n' +
			'echo "Argos"\n' +
			'echo "---"\n' +
			'echo "$URL | iconName=media-playback-start href=\'https://$URL\'"\n' +
			'echo "$DIR | iconName=folder-symbolic href=\'file://$DIR\'"\n\n';

		GLib.file_set_contents(scriptPath, scriptContents);
		GLib.spawn_sync(null, ["chmod", "+x", scriptPath], null, GLib.SpawnFlags.SEARCH_PATH, null);
	}
	*/

	directoryMonitor = directory.monitor_directory(Gio.FileMonitorFlags.WATCH_MOVES, null);
}

function refresh() {
}

function enable() {
	addButtons();
}

function disable() {
	removeButtons();
}

function addButtons() {

	let files = [];

	let enumerator = directory.enumerate_children(Gio.FILE_ATTRIBUTE_STANDARD_NAME, Gio.FileQueryInfoFlags.NONE, null);

	let fileInfo = null;
	while ((fileInfo = enumerator.next_file(null)) !== null) {
		let file = enumerator.get_child(fileInfo);
		if (GLib.file_test(file.get_path(), GLib.FileTest.IS_EXECUTABLE) && !GLib.file_test(file.get_path(), GLib.FileTest.IS_DIR) && !file.get_basename().startsWith(".")) {
			files.push(file);
		}
	}
	
	let settings = Utilities.parseFilename(files[0].get_basename());
	let button = new PanelMenuButton(files[0], settings.updateInterval);
	buttons.push(button);
	Main.panel.addToStatusArea("auto-ovpn", button, settings.position, settings.box);
}

function removeButtons() {
	for (let i = 0; i < buttons.length; i++) {
		buttons[i].destroy();
	}
	buttons = [];
}
