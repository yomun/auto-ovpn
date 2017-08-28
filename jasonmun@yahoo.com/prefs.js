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

const Gio     = imports.gi.Gio;
const GLib    = imports.gi.GLib;
const Gtk     = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const Lang    = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const Gettext = imports.gettext.domain('Auto-OVPN');
const _ = Gettext.gettext;

const SETTINGS_WIFI_MODE = 'wifi-mode';
const SETTINGS_COMPACT_MODE = 'compact-mode';
const SETTINGS_REFRESH_RATE = 'refresh-rate';
const SETTINGS_POSITION = 'position-in-panel';
const SETTINGS_COUNTRY_CODE = 'country-code';

const IPMenuSettingsWidget = new GObject.Class({
	Name: 'IPMenu.Prefs.IPMenuSettingsWidget',
	GTypeName: 'IPMenuSettingsWidget',
	Extends: Gtk.Grid,

	_init: function (params) {
		this.parent(params);
		this.margin = 24;
		this.row_spacing = 6;
		this.orientation = Gtk.Orientation.VERTICAL;

		this._settings = Convenience.getSettings(Me.metadata['settings-schema']);

		let presentLabel = '<b>' + _("Display Options") + '</b>';
		
		this.add(new Gtk.Label({ label: presentLabel, use_markup: true, halign: Gtk.Align.START }));

		let vbox = new Gtk.VBox();
		this.add(vbox);
		
		/* Check Box 1 */
		let checkContainer = new Gtk.HBox({spacing: 5});
		let checkLabel = new Gtk.Label({label: _('- Start / Stop VPN+WIFI')});
		let checkButton = new Gtk.CheckButton();

		checkContainer.pack_start(checkLabel, 0,0,0);
		checkContainer.pack_end(checkButton, 0,0,0);

		this._settings.bind(SETTINGS_WIFI_MODE, checkButton, 'active', Gio.SettingsBindFlags.DEFAULT);

		vbox.add(checkContainer);

		/* Check Box 2 */
		/*
		let checkContainer2 = new Gtk.HBox({spacing: 5});
		let checkLabel2 = new Gtk.Label({label: _('- Only Show Flag on Panel')});
		let checkButton2 = new Gtk.CheckButton();

		checkContainer2.pack_start(checkLabel2, 0,0,0);
		checkContainer2.pack_end(checkButton2, 0,0,0);

		this._settings.bind(SETTINGS_COMPACT_MODE, checkButton2, 'active', Gio.SettingsBindFlags.DEFAULT);

		vbox.add(checkContainer2);
		*/
		
		/* Select Box List (Country Code) */
		let positionContainer0 = new Gtk.HBox({spacing: 5});
		let positionLabel0 = new Gtk.Label({label: _('- VPN source that your prefer (GeoIP)')});
		let positionSelector0 = new Gtk.ComboBoxText();

		positionContainer0.pack_start(positionLabel0, 0,0,0);
		positionContainer0.pack_end(positionSelector0, 0,0,0);

		[_("ALL"),_("CN"),_("JP"),_("KR"),_("US")].forEach(function(item) {
			positionSelector0.append_text(item);
		});

		positionSelector0.set_active(this._settings.get_enum(SETTINGS_COUNTRY_CODE));
		
		let self = this;

		positionSelector0.connect('changed', function(pos) { self._settings.set_enum(SETTINGS_COUNTRY_CODE, positionSelector0.get_active()); });

		vbox.add(positionContainer0);

		/* Select Box List (left / center / right) */
		/*
		let positionContainer = new Gtk.HBox({spacing: 5});
		let positionLabel = new Gtk.Label({label: _('- Position on the Panel')});
		let positionSelector = new Gtk.ComboBoxText();

		positionContainer.pack_start(positionLabel, 0,0,0);
		positionContainer.pack_end(positionSelector, 0,0,0);

		[_("left"),_("center"),_("right")].forEach(function(item) {
			positionSelector.append_text(item);
		});

		positionSelector.set_active(this._settings.get_enum(SETTINGS_POSITION));

		positionSelector.connect('changed', function(pos) { self._settings.set_enum(SETTINGS_POSITION, positionSelector.get_active()); });

		vbox.add(positionContainer);
		*/

		/* Text Field (0-XXX) */
		/*
		let frequencyContainer = new Gtk.HBox({spacing: 5});
		let frequencyLabel = new Gtk.Label({label: _('- How Often to check for IP changes (in secs)')});
		let frequencySelector = new Gtk.SpinButton();

		frequencyContainer.pack_start(frequencyLabel, 0,0,0);
		frequencyContainer.pack_end(frequencySelector, 0,0,0);

		frequencySelector.set_numeric(true);

		frequencySelector.set_value(this._settings.get_value(SETTINGS_REFRESH_RATE));
		frequencySelector.set_range(10, 30000);
		frequencySelector.set_increments(10,100);

		this._settings.bind(SETTINGS_REFRESH_RATE, frequencySelector, 'value', Gio.SettingsBindFlags.DEFAULT);

		vbox.add(frequencyContainer);
		*/
		
		// Messages
		let labelContainer11 = new Gtk.HBox({spacing: 5});
		frequencyLabel = new Gtk.Label({label: _('\nPlease type \'ALT+F2\' and enter a command: \'r\' for activate above settings.')});
		labelContainer11.pack_start(frequencyLabel, 0,0,0);
		vbox.add(labelContainer11);
		
		let labelContainer0 = new Gtk.HBox({spacing: 5});
		frequencyLabel = new Gtk.Label({label: _('*****************************************************************\n')});
		labelContainer0.pack_start(frequencyLabel, 0,0,0);
		vbox.add(labelContainer0);
		
		let labelContainer1 = new Gtk.HBox({spacing: 5});
		frequencyLabel = new Gtk.Label({label: _('Please install OpenVPN before using VPN.\n')});
		labelContainer1.pack_start(frequencyLabel, 0,0,0);
		vbox.add(labelContainer1);
		
		let labelContainer2 = new Gtk.HBox({spacing: 5});
		frequencyLabel = new Gtk.Label();
		frequencyLabel.set_markup('<a href="https://github.com/yomun/auto-ovpn">https://github.com/yomun/auto-ovpn</a>');
		labelContainer2.pack_start(frequencyLabel, 0,0,0);
		vbox.add(labelContainer2);
		
		let labelContainer3 = new Gtk.HBox({spacing: 5});
		frequencyLabel = new Gtk.Label();
		frequencyLabel.set_markup('<a href="https://extensions.gnome.org/extension/1270/auto-ovpn">https://extensions.gnome.org/extension/1270/auto-ovpn</a>');
		labelContainer3.pack_start(frequencyLabel, 0,0,0);
		vbox.add(labelContainer3);
	},
});

function init() {
	Convenience.initTranslations("Auto-OVPN");
}

function buildPrefsWidget() {
	let widget = new IPMenuSettingsWidget();
	widget.show_all();

	return widget;
}
