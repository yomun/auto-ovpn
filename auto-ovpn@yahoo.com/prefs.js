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

const GObject = imports.gi.GObject;
const Gtk     = imports.gi.Gtk;
const Gio     = imports.gi.Gio;
const Lang    = imports.lang;

const CurrExtension = imports.misc.extensionUtils.getCurrentExtension();

const Gettext = imports.gettext;
const _ = Gettext.domain(CurrExtension.metadata['gettext-domain']).gettext;

const Fields = {
	SETTINGS_WIFI_MODE    : 'wifi-mode',
	SETTINGS_COMPACT_MODE : 'compact-mode',
	SETTINGS_MAPS_MODE    : 'maps-mode',
	SETTINGS_ICON_SIZE    : 'icon-size',
	SETTINGS_CHECK_IP     : 'check-ip',
	SETTINGS_POSITION     : 'position-in-panel',
	SETTINGS_COUNTRY_CODE : 'country-code',
	SETTINGS_REFRESH_RATE : 'refresh-rate'
};

const SCHEMA_NAME = 'org.gnome.shell.extensions.auto-ovpn';

const getSchema = function () {
	let schemaDir = CurrExtension.dir.get_child('schemas').get_path();
	let schemaSource = Gio.SettingsSchemaSource.new_from_directory(schemaDir, Gio.SettingsSchemaSource.get_default(), false);
	let schema = schemaSource.lookup(SCHEMA_NAME, false);

	return new Gio.Settings({ settings_schema: schema });
}

const SettingsSchema = getSchema();

function init() {
	let localeDir = CurrExtension.dir.get_child('locale');
	if (localeDir.query_exists(null))
		Gettext.bindtextdomain('Auto-OVPN', localeDir.get_path());
}

const App = new Lang.Class({
	Name: 'Indicator.App',
	_init: function() {
		this.main = new Gtk.Grid({ margin: 10, row_spacing: 5, column_spacing: 0, column_homogeneous: false, row_homogeneous: false });

		this.field_SETTINGS_WIFI_MODE    = new Gtk.Switch();
		this.field_SETTINGS_COMPACT_MODE = new Gtk.Switch();
		this.field_SETTINGS_MAPS_MODE    = new Gtk.Switch();
		this.field_SETTINGS_ICON_SIZE    = new Gtk.ComboBoxText();
		this.field_SETTINGS_POSITION     = new Gtk.ComboBoxText();
		this.field_SETTINGS_COUNTRY_CODE = new Gtk.ComboBoxText();
		this.field_SETTINGS_CHECK_IP     = new Gtk.ComboBoxText();
		this.field_SETTINGS_REFRESH_RATE = new Gtk.SpinButton({ adjustment: new Gtk.Adjustment({ lower: 5, upper: 300, step_increment: 5 }) });
		
		let f1Label = new Gtk.Label({ label: _("Start / Stop VPN+WIFI"),                                                                        hexpand: true, halign: Gtk.Align.START });
		let f2Label = new Gtk.Label({ label: _("Only Show Flag on Panel"),                                                                      hexpand: true, halign: Gtk.Align.START });
		let f3Label = new Gtk.Label({ label: _("Show Maps"),                                                                                    hexpand: true, halign: Gtk.Align.START });
		let f4Label = new Gtk.Label({ label: _("Flag Icon Size"),                                                                               hexpand: true, halign: Gtk.Align.START });
		let f5Label = new Gtk.Label({ label: _("Position on the Panel"),                                                                        hexpand: true, halign: Gtk.Align.START });
		let f6Label = new Gtk.Label({ label: _("VPN source that your prefer (GeoIP)"),                                                          hexpand: true, halign: Gtk.Align.START });
		let f8Label = new Gtk.Label({ label: _("Check IP"),                                                                                     hexpand: true, halign: Gtk.Align.START });
		let f7Label = new Gtk.Label({ label: _("How Often to check for IP changes (in secs)"),                                                  hexpand: true, halign: Gtk.Align.START });
		// let m0Label = new Gtk.Label({ label: _("\n* Please type \'Alt+F2\' and enter a command: \'r\' for activate above settings."),           hexpand: true, halign: Gtk.Align.START });
		let llLabel = new Gtk.Label({ label: _("--------------------------------------------------------------------------------------------------------------"), 
																			hexpand: true, halign: Gtk.Align.START });
		let lrLabel = new Gtk.Label({ label: _("------------------------------------"),                                                         hexpand: true, halign: Gtk.Align.START });
		let mgLabel = new Gtk.Label({ label: _(""),                                                                                             hexpand: true, halign: Gtk.Align.START });
		
		mgLabel.set_markup('* Please install OpenVPN before using VPN.\n'
			+ '<a href="https://github.com/yomun/auto-ovpn">https://github.com/yomun/auto-ovpn</a>\n'
			+ '<a href="https://extensions.gnome.org/extension/1355/auto-ovpn">https://extensions.gnome.org/extension/1355/auto-ovpn</a>');
		
		this.main.attach(f1Label, 2, 1, 2 ,1);
		this.main.attach(f2Label, 2, 2, 2 ,1);
		this.main.attach(f3Label, 2, 3, 2 ,1);
		this.main.attach(f4Label, 2, 4, 2 ,1);
		this.main.attach(f5Label, 2, 5, 2 ,1);
		this.main.attach(f6Label, 2, 6, 2 ,1);
		this.main.attach(f8Label, 2, 7, 2 ,1);
		this.main.attach(f7Label, 2, 8, 2 ,1);
		// this.main.attach(m0Label, 2, 9, 2 ,1);
		this.main.attach(llLabel, 2, 10, 2 ,1);
		this.main.attach(mgLabel, 2, 11, 2 ,1);

		this.main.attach(this.field_SETTINGS_WIFI_MODE,    4, 1, 2, 1);
		this.main.attach(this.field_SETTINGS_COMPACT_MODE, 4, 2, 2, 1);
		this.main.attach(this.field_SETTINGS_MAPS_MODE,    4, 3, 2, 1);
		this.main.attach(this.field_SETTINGS_ICON_SIZE,    4, 4, 2, 1);
		this.main.attach(this.field_SETTINGS_POSITION,     4, 5, 2, 1);
		this.main.attach(this.field_SETTINGS_COUNTRY_CODE, 4, 6, 2, 1);
		this.main.attach(this.field_SETTINGS_CHECK_IP,     4, 7, 2, 1);
		this.main.attach(this.field_SETTINGS_REFRESH_RATE, 4, 8, 2, 1);
		this.main.attach(lrLabel,                          4, 10, 2, 1);
		
		var self = this;
		
		[_("OpenDNS.com"),_("Google.com")].forEach(function(item) { self.field_SETTINGS_CHECK_IP.append_text(item); });
		[_("16"),_("24"),_("32"),_("48"),_("64")].forEach(function(item) { self.field_SETTINGS_ICON_SIZE.append_text(item); });
		[_("left"),_("center"),_("right")].forEach(function(item) { self.field_SETTINGS_POSITION.append_text(item); });
		[_("ALL"),_("AR"),_("CA"),_("CN"),_("DE"),_("FR"),_("GB"),_("HK"),_("ID"),_("JP"),_("KR"),_("PL"),_("RU"),_("TH"),_("US"),_("VE"),_("VN")].forEach(function(item) {
			self.field_SETTINGS_COUNTRY_CODE.append_text(item);
		});
		
		this.field_SETTINGS_CHECK_IP.set_active(    SettingsSchema.get_enum(Fields.SETTINGS_CHECK_IP));
		this.field_SETTINGS_ICON_SIZE.set_active(   SettingsSchema.get_enum(Fields.SETTINGS_ICON_SIZE));
		this.field_SETTINGS_POSITION.set_active(    SettingsSchema.get_enum(Fields.SETTINGS_POSITION));
		this.field_SETTINGS_COUNTRY_CODE.set_active(SettingsSchema.get_enum(Fields.SETTINGS_COUNTRY_CODE));
		
		this.field_SETTINGS_CHECK_IP.connect(    'changed', function(pos) { SettingsSchema.set_enum(Fields.SETTINGS_CHECK_IP,     self.field_SETTINGS_CHECK_IP.get_active()); });
		this.field_SETTINGS_ICON_SIZE.connect(   'changed', function(pos) { SettingsSchema.set_enum(Fields.SETTINGS_ICON_SIZE,    self.field_SETTINGS_ICON_SIZE.get_active()); });
		this.field_SETTINGS_POSITION.connect(    'changed', function(pos) { SettingsSchema.set_enum(Fields.SETTINGS_POSITION,     self.field_SETTINGS_POSITION.get_active()); });
		this.field_SETTINGS_COUNTRY_CODE.connect('changed', function(pos) { SettingsSchema.set_enum(Fields.SETTINGS_COUNTRY_CODE, self.field_SETTINGS_COUNTRY_CODE.get_active()); });
		
		SettingsSchema.bind(Fields.SETTINGS_WIFI_MODE,    this.field_SETTINGS_WIFI_MODE,    'active', Gio.SettingsBindFlags.DEFAULT);
		SettingsSchema.bind(Fields.SETTINGS_COMPACT_MODE, this.field_SETTINGS_COMPACT_MODE, 'active', Gio.SettingsBindFlags.DEFAULT);
		SettingsSchema.bind(Fields.SETTINGS_MAPS_MODE,    this.field_SETTINGS_MAPS_MODE,    'active', Gio.SettingsBindFlags.DEFAULT);
		SettingsSchema.bind(Fields.SETTINGS_REFRESH_RATE, this.field_SETTINGS_REFRESH_RATE, 'value' , Gio.SettingsBindFlags.DEFAULT);
        
		this.main.show_all();
	}
});

function buildPrefsWidget() {
	let widget = new App();
	return widget.main;
};
