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
const Clutter = imports.gi.Clutter;
const Gio     = imports.gi.Gio;
const GLib    = imports.gi.GLib;
const St      = imports.gi.St;
const Main    = imports.ui.main;

const ExtensionUtils = imports.misc.extensionUtils;
const CurrExtension  = ExtensionUtils.getCurrentExtension();
const Convenience    = CurrExtension.imports.convenience;

const SETTINGS_COMPACT_MODE = 'compact-mode';
const SETTINGS_ICON_SIZE    = 'icon-size';

const flags_path = CurrExtension.path + "/flags/";

let DEFAULT_ICON_SIZE = 16;

const BoxLayout = new Lang.Class({
	Name: "BoxLayout",
	Extends: St.BoxLayout,

	_init: function(line) {
		this.parent({ style_class: "" });

		/*
		if (typeof line != "undefined") 
			this.setMenuLine(line);
		*/
		
		this.prevIP = "127.0.0.1";
	},
	
	setPanelLine: function(ip, country_code) {
		
		if (this.prevIP != ip) {
			
			let flags_file_path = "";

			if (country_code.length == 2) {
				flags_file_path = flags_path + country_code.toLowerCase() + ".png";
			} else {
				flags_file_path = CurrExtension.path + "/icon.png";
			}

			this._settings = Convenience.getSettings(CurrExtension.metadata['settings-schema']);

			let gicon = null;
			let StIcon = null;

			if (GLib.file_test (flags_file_path, GLib.FileTest.EXISTS)) {

				let icon_size  = this._settings.get_string(SETTINGS_ICON_SIZE);
				if (icon_size.length > 0) {
					DEFAULT_ICON_SIZE = icon_size;
				}
				icon_size = null;

				gicon = Gio.icon_new_for_string(flags_file_path);
				StIcon = new St.Icon({ gicon: gicon, icon_size: DEFAULT_ICON_SIZE});
				this.remove_all_children();
				this.add_child(StIcon);
			} else {
				flags_file_path = "http://www.formyip.com/images/" + country_code.toLowerCase() + ".gif";
				/*	
				"https://db-ip.com/img/flags/" + country_code.toUpperCase() + ".png";
				"https://github.com/madebybowtie/FlagKit/raw/master/Images/" + country_code.toUpperCase() + ".png";
				"https://github.com/gosquared/flags/raw/master/flags/flags-iso/shiny/64/" + country_code.toUpperCase() + ".png";
				"https://github.com/emcrisostomo/flags/raw/master/png/256/" + country_code.toUpperCase() + ".png";
				"https://github.com/stevenrskelton/flag-icon/raw/master/png/225/country-4x3/" + country_code + ".png";
				"https://lipis.github.io/flag-icon-css/flags/4x3/" + country_code + ".svg";
				"https://cdn.rawgit.com/hjnilsson/country-flags/master/svg/" + country_code + ".svg";
				"https://github.com/hjnilsson/country-flags/raw/master/svg/" + country_code + ".svg";
				"https://github.com/lipis/flag-icon-css/raw/master/flags/4x3/" + country_code + ".svg";
				*/
				gicon = Gio.icon_new_for_string(flags_file_path);
				StIcon = new St.Icon({ gicon: gicon, icon_size: 25});
				this.remove_all_children();
				this.add_child(StIcon);
			}

			let label = new St.Label({ y_expand: true, y_align: Clutter.ActorAlign.CENTER });		
			this.add_child(label);

			this._compactMode  = this._settings.get_boolean(SETTINGS_COMPACT_MODE);

			if (this._compactMode == false) {
				label.set_text(" " + ip);
			}

			flags_file_path = null;
			gicon = null;
			StIcon = null;
			label = null;
		}
		
		this.prevIP = ip;
		
	},

	setMenuLine: function(line) {
		
		this.remove_all_children();
			
		this.line = line;

		if (line.hasOwnProperty("iconName")) {
			this.add_child(new St.Icon({ style_class: "popup-menu-icon", icon_name: line.iconName }));
		}

		let label = new St.Label({ y_expand: true, y_align: Clutter.ActorAlign.CENTER });
		this.add_child(label);
		
		let clutterText = label.get_clutter_text();
		clutterText.text = "  " + line.markup;
		
		label = null;
		clutterText = null;
	},
	
	destroy: function () {
	}
});
