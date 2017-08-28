/*
 * Auto OVPN gnome extension
 * https://jasonmun.blogspot.my
 * https://github.com/yomun/auto-ovpn
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
 * along with Auto OVPN gnome extension.  If not, see <http://www.gnu.org/licenses/>.
 * 
 */

const Lang = imports.lang;
const Gio  = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Main = imports.ui.main;
const PopupMenu   = imports.ui.popupMenu;
const AltSwitcher = imports.ui.status.system.AltSwitcher;
const Extension   = imports.misc.extensionUtils.getCurrentExtension();
const Button      = Extension.imports.button;
const BoxLayout   = Extension.imports.boxlayout.BoxLayout;

const MenuItem = new Lang.Class({
	Name: "MenuItem",
	Extends: PopupMenu.PopupBaseMenuItem,

	_init: function(button, line, alternateLine) {
		let hasAction = line.hasAction || (typeof alternateLine !== "undefined" && alternateLine.hasAction);

		this.parent({
			activate: hasAction,
			hover: hasAction,
			can_focus: hasAction
		});

		let altSwitcher = null;

		let boxlayout = new BoxLayout(line);

		if (typeof alternateLine === "undefined") {
			this.actor.add_child(boxlayout);
		} else {
			let alternateBoxLayout = new LineView(alternateLine);
			altSwitcher = new AltSwitcher(lineView, alternateBoxLayout);
			boxlayout.visible = true;
			alternateBoxLayout.visible = true;
			this.actor.add_child(altSwitcher.actor);
		}

		if (hasAction) {
			this.connect("activate", Lang.bind(this, function() {
				let activeLine = (altSwitcher === null) ? line : altSwitcher.actor.get_child().line;

				if (activeLine.hasOwnProperty("bash")) {
					let argv = [];

					if (activeLine.terminal === "false") {
						argv = ["bash", activeLine.bash];
					} else {
						argv = ["gnome-terminal", "-e", "bash -c " + GLib.shell_quote(activeLine.bash + "; exec bash")];
					}

					GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null);
					/*
					if (activeLine.bash.indexOf("/del-vpngate.sh") > -1) {
						Main.notify("Delete OVPN Completely..");
					}
					*/
					Button._change_LOOP_SEC(4);
				}
			}));
		}
	},
	
	destroy: function () {
	}
});
