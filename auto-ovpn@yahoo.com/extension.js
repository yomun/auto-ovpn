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

const Lang        = imports.lang;
const Gio         = imports.gi.Gio;
const GLib        = imports.gi.GLib;
const Shell       = imports.gi.Shell;
const Soup        = imports.gi.Soup;
const St          = imports.gi.St;
const Main        = imports.ui.main;
const PanelMenu   = imports.ui.panelMenu;
const PopupMenu   = imports.ui.popupMenu;
const Mainloop    = imports.mainloop;

const ExtensionUtils = imports.misc.extensionUtils;
const CurrExtension  = ExtensionUtils.getCurrentExtension();

const maps_path      = CurrExtension.path + "/maps";
const shell_path     = CurrExtension.path + "/sh";
const BoxLayout      = CurrExtension.imports.boxlayout.BoxLayout;
const Convenience    = CurrExtension.imports.convenience;
const Utilities      = CurrExtension.imports.utilities;
const Metadata       = CurrExtension.metadata;

const Gettext = imports.gettext.domain(Metadata['gettext-domain']);
const _ = Gettext.gettext;

const SETTINGS_WIFI_MODE    = 'wifi-mode';
const SETTINGS_MAPS_MODE    = 'maps-mode';
const SETTINGS_CHECK_IP     = 'check-ip';
const SETTINGS_POSITION     = 'position-in-panel';
const SETTINGS_COUNTRY_CODE = 'country-code';
const SETTINGS_REFRESH_RATE = 'refresh-rate';

const IP_RE = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

const IP_RE_IN_STR = /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/

const CD_RE = /^([a-z][a-z])$/

const HTML_TAGS_RE = /<[^>]*>/g

const NOT_CONNECTED = "Auto OVPN";

const DEFAULT_COUNTRY_CODE = "icon"

const DEFAULT_ICON_SIZE = 16;

const DEFAULT_MAP_SIZE  = 150;

const ARR_URL_IP = [];
const ARR_URL_CODE = [];

let CURRENT_IP     = null;
let IP_FROM_GOOGLE = null;
let LST_IP         = null;
let LAST_IP        = null;
let LOCATION       = null;
let LST_COUNTRY    = null;
let URL_IP         = null;
let URL_IP_COUNTRY   = null;
let URL_COUNTRY      = null;
let RETURN_DATA      = null;
let RET_COUNTRY_CODE = null;

let _httpSession = null;

let redraw = 0;

let temp = null;

let menu_item_MAP_INFO       = null;
let menu_item_VPN_START      = null;
let menu_item_VPN_STOP       = null;
let menu_item_VPN_WIFI_START = null;
let menu_item_VPN_WIFI_STOP  = null;
let menu_item_DELETE         = null;
let menu_item_CHANGE_VPN     = null;

let ipInfoBox = null;

const PanelMenuButton = new Lang.Class({
	Name: "PanelMenuButton",
	Extends: PanelMenu.Button,

	_init: function(file, updateInterval) {
		this.parent(0, "", false);
		
		this._textureCache = St.TextureCache.get_default();
		
		this._settings = Convenience.getSettings(CurrExtension.metadata['settings-schema']);
		
		let self = this;
		
		// URL for get IP
		ARR_URL_IP.push("http://ipinfo.io/ip");
		ARR_URL_IP.push("http://checkip.dyndns.com/");
		ARR_URL_IP.push("http://checkip.dyndns.org/");
		ARR_URL_IP.push("http://checkip.dyn.com/");
		ARR_URL_IP.push("http://icanhazip.com/");
		ARR_URL_IP.push("http://ipecho.net/plain");
		ARR_URL_IP.push("https://l2.io/ip.js?var=myip");
		ARR_URL_IP.push("https://api.ipify.org?format=jsonp&callback=getIP");
		ARR_URL_IP.push("https://api.userinfo.io/userinfos");
		
		ARR_URL_IP.push("http://www.showmyip.gr/");
		ARR_URL_IP.push("http://www.showip.com/");
		ARR_URL_IP.push("http://www.showmemyip.com/");
		ARR_URL_IP.push("http://ifconfig.co/");
		ARR_URL_IP.push("http://www.checkip.com/");
		ARR_URL_IP.push("http://www.geoplugin.com/webservices/json");
		ARR_URL_IP.push("https://www.whatismyip.net/");
		ARR_URL_IP.push("https://showip.net/");
		ARR_URL_IP.push("https://www.iplocation.net/hide-ip-with-vpn");
		
		URL_IP = ARR_URL_IP[0];
		
		// URL for get Country Code
		ARR_URL_CODE.push("http://ipinfo.io/");
		ARR_URL_CODE.push("https://ipapi.co/");
		ARR_URL_CODE.push("https://db-ip.com/");
		ARR_URL_CODE.push("http://getcitydetails.geobytes.com/GetCityDetails?fqcn=");
		ARR_URL_CODE.push("https://www.geoip-db.com/json/");
		ARR_URL_CODE.push("http://freegeoip.net/json/");
		ARR_URL_CODE.push("http://geoip.nekudo.com/api/");
		
		URL_COUNTRY = ARR_URL_CODE[0];
		
		// Maps + IP Info
		ipInfoBox = new St.BoxLayout({style_class: 'ip-info-box', vertical: true});
		
		this._mapBox = new St.BoxLayout();

		this._mapBox.add_actor(new St.Icon({gicon: Gio.icon_new_for_string(CurrExtension.path + '/default_map.png'), icon_size: DEFAULT_MAP_SIZE}));
		
		let boxLayout = new St.BoxLayout();
		boxLayout.add_actor(this._mapBox);
		boxLayout.add_actor(ipInfoBox);
		
		menu_item_MAP_INFO = new PopupMenu.PopupMenuItem("");
		menu_item_MAP_INFO.actor.add(boxLayout);
		boxLayout = null;
			
		menu_item_MAP_INFO.connect('activate', function() {
			if (LOCATION !== null) {
				let link = 'https://www.google.com/maps/place/' + LOCATION;
				let argv = ["xdg-open", link];
				GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null);
				argv = null; link = null;
			}
		});
			
		this.menu.addMenuItem(menu_item_MAP_INFO);
		menu_item_MAP_INFO.actor.show();

		this._putIPDetails(ipInfoBox);
		
		ipInfoBox = null;

		// Preferences
		let _appSys = Shell.AppSystem.get_default();
		let _gsmPrefs = _appSys.lookup_app('gnome-shell-extension-prefs.desktop');
		let prefs = new PopupMenu.PopupMenuItem(_(" Preferences..."));
		prefs.connect('activate', function() {
			if (_gsmPrefs.get_state() == _gsmPrefs.SHELL_APP_STATE_RUNNING) {
				_gsmPrefs.activate();
			} else {
				let info = _gsmPrefs.get_app_info();
				let timestamp = global.display.get_current_time_roundtrip();
				info.launch_uris([Metadata.uuid], global.create_app_launch_context(timestamp, -1));
				info = null; timestamp = null;
				
				let argv = ["bash", shell_path + "/stop-vpngate.sh"];
				GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null);
				argv = null;
				
				if (this._wifiMode) {
					menu_item_MAP_INFO.actor.hide();
					menu_item_VPN_START.actor.hide();
					menu_item_VPN_STOP.actor.hide();
					menu_item_VPN_WIFI_START.actor.show();
					menu_item_VPN_WIFI_STOP.actor.hide();
					menu_item_DELETE.actor.show();
				} else {
					menu_item_MAP_INFO.actor.show();
					menu_item_VPN_START.actor.show();
					menu_item_VPN_STOP.actor.hide();
					menu_item_VPN_WIFI_START.actor.hide();
					menu_item_VPN_WIFI_STOP.actor.hide();
					menu_item_DELETE.actor.show();
				}
				menu_item_CHANGE_VPN.actor.hide();
			}
		});		
		this.menu.addMenuItem(prefs);		
		_appSys = null; prefs = null;

		// Start VPN
		menu_item_VPN_START = new PopupMenu.PopupMenuItem('');
		let boxLayout311 = new St.BoxLayout();
		let boxLayout312 = new St.BoxLayout();
		boxLayout312.add_actor(new St.Icon({ style_class: 'popup-menu-icon', icon_name: 'media-playback-start', icon_size: DEFAULT_ICON_SIZE }));
		boxLayout312.add_actor(new St.Label({ text: _(" Start VPN") }));
		boxLayout311.add_actor(boxLayout312);
		menu_item_VPN_START.actor.add(boxLayout311);
		this.menu.addMenuItem(menu_item_VPN_START);
		menu_item_VPN_START.connect('activate', function() {
			let CODE = "";
			if (self._countryCode == "ALL") { CODE = ""; } else { CODE = self._countryCode; }
			let argv = ["bash", shell_path + "/start-vpngate.sh", CODE];
			GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null);
			argv = null;
			menu_item_MAP_INFO.actor.show();
			menu_item_VPN_START.actor.hide();
			menu_item_VPN_STOP.actor.show();
			menu_item_VPN_WIFI_START.actor.hide();
			menu_item_VPN_WIFI_STOP.actor.hide();
			menu_item_DELETE.actor.hide();
			menu_item_CHANGE_VPN.actor.show();
		});
		boxLayout311 = null; boxLayout312 = null;
		
		// Stop VPN
		menu_item_VPN_STOP = new PopupMenu.PopupMenuItem('');
		let boxLayout321 = new St.BoxLayout();
		let boxLayout322 = new St.BoxLayout();
		boxLayout322.add_actor(new St.Icon({ style_class: 'popup-menu-icon', icon_name: 'media-playback-stop', icon_size: DEFAULT_ICON_SIZE }));
		boxLayout322.add_actor(new St.Label({ text: _(" Stop VPN") }));
		boxLayout321.add_actor(boxLayout322);
		menu_item_VPN_STOP.actor.add(boxLayout321);
		this.menu.addMenuItem(menu_item_VPN_STOP);
		menu_item_VPN_STOP.connect('activate', function() {
			let CODE = "";
			if (self._countryCode == "ALL") { CODE = ""; } else { CODE = self._countryCode; }
			let argv = ["bash", shell_path + "/start-vpngate.sh", CODE];
			GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null);
			argv = null;
			menu_item_MAP_INFO.actor.show();
			menu_item_VPN_START.actor.show();
			menu_item_VPN_STOP.actor.hide();
			menu_item_VPN_WIFI_START.actor.hide();
			menu_item_VPN_WIFI_STOP.actor.hide();
			menu_item_DELETE.actor.show();
			menu_item_CHANGE_VPN.actor.hide();
		});
		boxLayout321 = null; boxLayout322 = null;

		// Start VPN + WIFI
		menu_item_VPN_WIFI_START = new PopupMenu.PopupMenuItem('');
		let boxLayout211 = new St.BoxLayout();
		let boxLayout212 = new St.BoxLayout();
		boxLayout212.add_actor(new St.Icon({ style_class: 'popup-menu-icon', icon_name: 'media-playback-start', icon_size: DEFAULT_ICON_SIZE }));
		boxLayout212.add_actor(new St.Label({ text: _(" Start VPN+WIFI") }));
		boxLayout211.add_actor(boxLayout212);
		menu_item_VPN_WIFI_START.actor.add(boxLayout211);
		this.menu.addMenuItem(menu_item_VPN_WIFI_START);
		menu_item_VPN_WIFI_START.connect('activate', function() {
			let MODE = "";
			let CODE = "";
			if (self._wifiMode)             { MODE = "wifi"; } else { MODE = ""; }
			if (self._countryCode == "ALL") { CODE = "";     } else { CODE = self._countryCode; }
			let argv = ["bash", shell_path + "/start-vpngate.sh", MODE, CODE];
			GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null);
			argv = null;
			menu_item_MAP_INFO.actor.show();
			menu_item_VPN_START.actor.hide();
			menu_item_VPN_STOP.actor.hide();
			menu_item_VPN_WIFI_START.actor.hide();
			menu_item_VPN_WIFI_STOP.actor.show();
			menu_item_DELETE.actor.hide();
			menu_item_CHANGE_VPN.actor.show();
		});
		boxLayout211 = null; boxLayout212 = null;
		
		// Stop VPN + WIFI
		menu_item_VPN_WIFI_STOP = new PopupMenu.PopupMenuItem('');
		let boxLayout221 = new St.BoxLayout();
		let boxLayout222 = new St.BoxLayout();
		boxLayout222.add_actor(new St.Icon({ style_class: 'popup-menu-icon', icon_name: 'media-playback-stop', icon_size: DEFAULT_ICON_SIZE }));
		boxLayout222.add_actor(new St.Label({ text: _(" Stop VPN+WIFI") }));
		boxLayout221.add_actor(boxLayout222);
		menu_item_VPN_WIFI_STOP.actor.add(boxLayout221);
		this.menu.addMenuItem(menu_item_VPN_WIFI_STOP);
		menu_item_VPN_WIFI_STOP.connect('activate', function() {
			let MODE = "";
			let CODE = "";
			if (self._wifiMode)             { MODE = "wifi"; } else { MODE = ""; }
			if (self._countryCode == "ALL") { CODE = "";     } else { CODE = self._countryCode; }
			let argv = ["bash", shell_path + "/start-vpngate.sh", MODE, CODE];
			GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null);
			argv = null;
			menu_item_MAP_INFO.actor.hide();
			menu_item_VPN_START.actor.hide();
			menu_item_VPN_STOP.actor.hide();
			menu_item_VPN_WIFI_START.actor.show();
			menu_item_VPN_WIFI_STOP.actor.hide();
			menu_item_DELETE.actor.show();
			menu_item_CHANGE_VPN.actor.hide();
		});
		boxLayout221 = null; boxLayout222 = null;
		
		// Delete all of VPN
		menu_item_DELETE = new PopupMenu.PopupMenuItem('');
		let boxLayout1 = new St.BoxLayout();
		let boxLayout2 = new St.BoxLayout();
		boxLayout2.add_actor(new St.Icon({ style_class: 'popup-menu-icon', icon_name: 'edit-clear', icon_size: DEFAULT_ICON_SIZE }));
		boxLayout2.add_actor(new St.Label({ text: _(" Delete all of VPN") }));
		boxLayout1.add_actor(boxLayout2);
		menu_item_DELETE.actor.add(boxLayout1);
		this.menu.addMenuItem(menu_item_DELETE);
		menu_item_DELETE.connect('activate', function() {
			let argv = ["bash", shell_path + "/del-vpngate.sh", "DEL"];
			GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null);
			argv = null;
		});
		boxLayout1 = null; boxLayout2 = null;
		
		// Change VPN
		menu_item_CHANGE_VPN = new PopupMenu.PopupMenuItem('');
		let boxLayout41 = new St.BoxLayout();
		let boxLayout42 = new St.BoxLayout();
		boxLayout42.add_actor(new St.Icon({ style_class: 'popup-menu-icon', icon_name: 'media-skip-forward', icon_size: DEFAULT_ICON_SIZE }));
		boxLayout42.add_actor(new St.Label({ text: _(" Change VPN") }));
		boxLayout41.add_actor(boxLayout42);
		menu_item_CHANGE_VPN.actor.add(boxLayout41);
		this.menu.addMenuItem(menu_item_CHANGE_VPN);
		menu_item_CHANGE_VPN.connect('activate', function() {
			let argv = ["bash", shell_path + "/edit-vpngate.sh"];
			GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null);
			argv = null;
		});
		boxLayout41 = null; boxLayout42 = null;
		
		this.setPrefs();
		this.setShowHide();
		
		this._settings.connect('changed', Lang.bind(this, function() {
			
			let position = this._settings.get_string(SETTINGS_POSITION);
			if (this._prevMenuPosition !== position) {
				this.setPrefs();
			
				if (this._timeout) {
					Mainloop.source_remove(this._timeout);
				}
		
				this._timeout = undefined;

				this._removeTimeout();
				this._BoxLayout.remove_all_children();
			
				reset_Indicator();
			} else {
				this.setPrefs();
			}
		}));
		
		this._file = file;

		if (this._BoxLayout == null) {
			this._BoxLayout = new BoxLayout();
			this.actor.add_actor(this._BoxLayout);
		}
		
		this._BoxLayout.setPanelLine(NOT_CONNECTED, DEFAULT_COUNTRY_CODE);

		redraw = 0;

		this._refresh();
	},
	
	_putIPDetails: function(ipInfoBox) {
		Object.keys(DEFAULT_DATA).map(function(key) {
			let ipInfoRow = new St.BoxLayout();
			ipInfoBox.add_actor(ipInfoRow);
			
			if ((_(key) == 'ip') || (_(key) == 'hostname')) {
				if (DEFAULT_DATA[key] == '') {
					this['_' + key] = new St.Label({style_class: 'ip-info-value', text: ''});
				} else {
					this['_' + key] = new St.Label({style_class: 'ip-info-value', text: DEFAULT_DATA[key]});
				}
			} else {
				if (_(key) == 'loc') {
					ipInfoRow.add_actor(new St.Label({style_class: 'ip-info-key', text: 'location : '}));
				} else if(_(key) == 'org') {
					ipInfoRow.add_actor(new St.Label({style_class: 'ip-info-key', text: 'organization : '}));
				} else {
					ipInfoRow.add_actor(new St.Label({style_class: 'ip-info-key', text: _(key) + ' : '}));
				}
				
				if (DEFAULT_DATA[key] == '') {
					this['_' + key] = new St.Label({style_class: 'ip-info-value', text: '-'});
				} else {
					this['_' + key] = new St.Label({style_class: 'ip-info-value', text: DEFAULT_DATA[key]});
				}
			}
				
			ipInfoRow.add_actor(this['_' + key]);
		});
	},
	
	setPrefs: function() {
		this._prevMapsMode     = this._mapsMode;
		this._prevWifiMode     = this._wifiMode;
		this._prevMenuPosition = this._menuPosition;
		this._prevCheckIP      = this._checkIP;
		this._prevCountryCode  = this._countryCode;
		this._prevRefreshRate  = this._refreshRate;

		this._mapsMode     = this._settings.get_boolean(SETTINGS_MAPS_MODE);
		this._wifiMode     = this._settings.get_boolean(SETTINGS_WIFI_MODE);
		this._menuPosition = this._settings.get_string(SETTINGS_POSITION);
		this._checkIP      = this._settings.get_string(SETTINGS_CHECK_IP);
		this._countryCode  = this._settings.get_string(SETTINGS_COUNTRY_CODE);
		this._refreshRate  = this._settings.get_int(SETTINGS_REFRESH_RATE);
	},
	
	setShowHide: function() {
		let argv = ["bash", shell_path + "/check-vpngate.sh"];
		let [result, output, std_err, status] = this._spawnWithPipes(argv);
		if (result) {
			if (output !== null) {
				if (output.toString().trim().length > 0) {
					let v = parseInt(output);
					if (v > 1) {
						if (this._wifiMode) {
							menu_item_MAP_INFO.actor.show();
							menu_item_VPN_START.actor.hide();
							menu_item_VPN_STOP.actor.hide();
							menu_item_VPN_WIFI_START.actor.hide();
							menu_item_VPN_WIFI_STOP.actor.show();
							menu_item_DELETE.actor.hide();
						} else {
							menu_item_MAP_INFO.actor.show();
							menu_item_VPN_START.actor.hide();
							menu_item_VPN_STOP.actor.show();
							menu_item_VPN_WIFI_START.actor.hide();
							menu_item_VPN_WIFI_STOP.actor.hide();
							menu_item_DELETE.actor.hide();
						}
						menu_item_CHANGE_VPN.actor.show();
					} else {
						if (this._wifiMode) {
							menu_item_MAP_INFO.actor.hide();
							menu_item_VPN_START.actor.hide();
							menu_item_VPN_STOP.actor.hide();
							menu_item_VPN_WIFI_START.actor.show();
							menu_item_VPN_WIFI_STOP.actor.hide();
							menu_item_DELETE.actor.show();
						} else {
							menu_item_MAP_INFO.actor.show();
							menu_item_VPN_START.actor.show();
							menu_item_VPN_STOP.actor.hide();
							menu_item_VPN_WIFI_START.actor.hide();
							menu_item_VPN_WIFI_STOP.actor.hide();
							menu_item_DELETE.actor.show();
						}
						menu_item_CHANGE_VPN.actor.hide();
					}
					v = null;
				}
			}
		}
		argv = null;
	},

	_update: function() {
		/*
		try {
			Utilities.spawnWithCallback(null, [this._file.get_path()], null, 0, null, Lang.bind(this, function(standardOutput) {				
				let output = standardOutput.split("\n");
				for (let i = 0; i < output.length; i++) {
				if (output[i].trim().length > 0) {
					this.menu.addMenuItem(new MenuItem(this, Utilities.parseLine(output[i])));
				}
			}
			}));
		} catch (error) {
			log("Unable to execute file '" + this._file.get_basename() + "': " + error);
		}
		*/
	},
	
	_refresh: function () {
		this._loadData();
		
		this._removeTimeout();
		this._timeout = Mainloop.timeout_add_seconds(this._refreshRate, Lang.bind(this, this._refresh));
		return true;
	},

	_url_add_ip: function () {
		let w = "";
		if (URL_COUNTRY.indexOf("ipinfo.io") > -1)                          { w = "http://ipinfo.io/" + CURRENT_IP + "/country";
		} else if (URL_COUNTRY.indexOf("ipapi.co") > -1)                    { w = "https://ipapi.co/" + CURRENT_IP + "/country";
		} else if (URL_COUNTRY.indexOf("db-ip.com") > -1)                   { w = "https://db-ip.com/" + CURRENT_IP;
		} else if (URL_COUNTRY.indexOf("freegeoip.net") > -1)               { w = "http://freegeoip.net/json/" + CURRENT_IP;
		} else if (URL_COUNTRY.indexOf("geoip.nekudo.com") > -1)            { w = "http://geoip.nekudo.com/api/" + CURRENT_IP;
		} else if (URL_COUNTRY.indexOf("getcitydetails.geobytes.com") > -1) { w = "http://getcitydetails.geobytes.com/GetCityDetails?fqcn=" + CURRENT_IP;
		}
		URL_IP_COUNTRY = w;
	},
	
	_process_data: function (i, s) {
		RETURN_DATA = "";	
		if (i == 0) {
			this._find_ip(s, '');  s = temp;
		} else {
			if (URL_IP_COUNTRY.indexOf("db-ip.com") > -1)                          { this._find_wd(s, '/img/flags/', '.');          s = temp;
			} else if (URL_IP_COUNTRY.indexOf("freegeoip.net") > -1)               { this._find_wd(s, '"country_code":"', '"');     s = temp;
			} else if (URL_IP_COUNTRY.indexOf("geoip.nekudo.com") > -1)            { this._find_wd(s, '"code":"', '"');             s = temp;
			} else if (URL_IP_COUNTRY.indexOf("getcitydetails.geobytes.com") > -1) { this._find_wd(s, '"geobytesinternet":"', '"'); s = temp;
			} else if (URL_IP_COUNTRY.indexOf("www.geoip-db.com") > -1)            { this._find_wd(s, '"country_code":"', '"');     s = temp;
			}
		}
		RETURN_DATA = s.trim();
	},
	
	_find_ip_country: function (word) {
		let w = word;
		if (URL_IP.indexOf("api.userinfo.io") > -1) {
			// "country":{"name":"Malaysia","code":"MY"}
			let k = w.lastIndexOf('"country":{"name":"');
			if (k > 0) {
				w = w.substr(k+19);
				k = w.indexOf('","code":"');
				w = w.substr(k+10);
				k = w.indexOf('"');
				w = w.substring(0,k);
			}
		} else if (URL_IP.indexOf("geoplugin.com") > -1) {
			let k = w.indexOf('"geoplugin_countryCode":"');
			if (k > 0) {
				w = w.substring(k+25, k+27);
			}
		} else if (URL_IP.indexOf("iplocation.net") > -1) {
			let k = w.indexOf('/assets/images/flags/');
			if (k > 0) {
				w = w.substring(k+21, k+23);
			}
		}
		
		if (w.length == 2) {
			temp = w;
		} else {
			temp = "";
		}
	},
	
	_find_ip: function (word, word_postfix) {
		let w = word;
		let k = w.search(IP_RE_IN_STR);
		if (k > 0) {
			w = w.substr(k);
			if (word_postfix == "") {
				for (k=15; k>0; k--) {
					if (w.substring(0, k).search(IP_RE) == 0)
						break;
				}
			} else {
				k = w.indexOf(word_postfix);
			}

			this._find_ip_country(w);
			RET_COUNTRY_CODE = temp;			
			
			w = w.substring(0, k);
		}
		temp = w;
	},
	
	_find_wd: function (word, word_prefix, word_postfix) {
		let w = word;
		let k = w.indexOf(word_prefix);
		if (k > 0) {
			w = w.substr(k+word_prefix.length);
			k = w.indexOf(word_postfix);
			w = w.substring(0,k);
		}
		temp = w;
	},
	
	_soup_data: function (i, param_ip) {
		let params = {};
		
		_httpSession = new Soup.Session();
		
		if (i == 0) {
			
			// Use it get Public IP (dig TXT +short o-o.myaddr.l.google.com @ns1.google.com)			
			this._get_ip_from_google();
			
			if (IP_FROM_GOOGLE.length > 0) {
				CURRENT_IP = IP_FROM_GOOGLE;
				this._soup_data(1, CURRENT_IP);
			} else {
				let self = this;
				
				// Use it get Public IP by using SOUP
				let message = Soup.form_request_new_from_hash('GET', URL_IP, params);
				_httpSession.queue_message(message, Lang.bind(this, function (_httpSession, message) {
					CURRENT_IP = "";
					if (message.status_code !== 200) {
						this._BoxLayout.setPanelLine(NOT_CONNECTED, DEFAULT_COUNTRY_CODE);
						this._change_Lookup_Service_URL(0);
					} else {
						this._process_data(0, message.response_body.data.trim());
					
						if (RETURN_DATA.match(IP_RE)) {
							CURRENT_IP = RETURN_DATA;
							self._soup_data(1, CURRENT_IP);
						}
					}
				}));
				message = null;
			}
			
		} else {
			
			// Use it get Country Code, if got install geoip-bin
			let CODE = "";
			
			if (CURRENT_IP !== LST_IP) {
				CODE = _get_country_code(CURRENT_IP);
			} else {
				CODE = LST_COUNTRY;
			}
			
			if (CODE.length == 2) {
				LST_IP = CURRENT_IP;
				LST_COUNTRY = CODE;
				this._BoxLayout.setPanelLine(CURRENT_IP, CODE);
			} else {
				this._url_add_ip();
				
				// Use it get Country Code by using SOUP
				let message = Soup.form_request_new_from_hash('GET', URL_IP_COUNTRY, params);
				_httpSession.queue_message(message, Lang.bind(this, function (_httpSession, message) {
					if (message.status_code !== 200) {
						this._BoxLayout.setPanelLine(NOT_CONNECTED, DEFAULT_COUNTRY_CODE);
						this._change_Lookup_Service_URL(1);
					} else {
						this._process_data(1, message.response_body.data.trim().toLowerCase());
					
						if (RETURN_DATA.match(CD_RE)) {
							let CODE = RETURN_DATA;
			
							if (CODE.length == 2) {
								LST_IP = CURRENT_IP;
								LST_COUNTRY = CODE;
								this._BoxLayout.setPanelLine(CURRENT_IP, CODE);
							} else {
								this._BoxLayout.setPanelLine(NOT_CONNECTED, DEFAULT_COUNTRY_CODE);
							}
						
							CODE = null;
						} else {
							this._BoxLayout.setPanelLine(NOT_CONNECTED, DEFAULT_COUNTRY_CODE);
						}
					
						RETURN_DATA = "";
					}
				}));
				message = null;
			}			
		}
	},
	
	_updateGoogleMap: function() {		
		if (CURRENT_IP !== null) {
			if (CURRENT_IP.search(IP_RE) == 0) {
	
				let map_file_path = maps_path + '/latest_map_' + CURRENT_IP + '.png';
		
				if (GLib.file_test (map_file_path, GLib.FileTest.EXISTS)) {
					let scaleFactor = St.ThemeContext.get_for_stage(global.stage).scale_factor;
					this._mapBox.destroy_all_children();
					if (parseFloat(Convenience.getVersion()) < 3.16) {
						this._mapBox.add_child(this._textureCache.load_uri_async(Gio.file_new_for_path(map_file_path).get_uri(), -1, DEFAULT_MAP_SIZE, scaleFactor));
					} else {
						this._mapBox.add_child(this._textureCache.load_file_async(Gio.file_new_for_path(map_file_path), -1, DEFAULT_MAP_SIZE, scaleFactor));
					}
					scaleFactor = null;
				}
				
				map_file_path = null;
			}
		}
	},
	
	_loadData: function () {
		this._soup_data(0, "");

		if (CURRENT_IP !== null) {
			if (CURRENT_IP !== LAST_IP) {
				this.setShowHide();
				let self = this;
				_getIPDetails(CURRENT_IP, function(err, ipData) {
					if (ipData) {
						if (CURRENT_IP == ipData.ip) {
							if (CURRENT_IP.search(IP_RE) == 0) {
							
								this['_ip'].text = '';
								this['_hostname'].text = '';
								this['_city'].text = '-';
								this['_region'].text = '-';
								this['_country'].text = '-';
								this['_loc'].text = '-';
								this['_org'].text = '-';
								this['_postal'].text = '-';
							
								Object.keys(ipData).map(function(key) {
									if ((ipData[key] == '') || (ipData[key] == '-')) {
										if (key == "hostname") {
											this['_' + key].text = '';
										} else {
											this['_' + key].text = '-';
										}
									} else {
										if (ipData[key].length > 0) {
											if (key == "hostname") {
												this['_' + key].text = ipData[key];
											} else {
												this['_' + key].text = ipData[key];
											}
										}
									}
								});
								
								self._mapBox.destroy_all_children();
								
								if (self._mapsMode) {
									self._mapBox.add_actor(new St.Icon({gicon: Gio.icon_new_for_string(CurrExtension.path + '/default_map.png'), icon_size: DEFAULT_MAP_SIZE}));

									let map_file_path = maps_path + '/latest_map_' + CURRENT_IP + '.png';

									if (GLib.file_test (map_file_path, GLib.FileTest.EXISTS)) {
										self._updateGoogleMap();
										LOCATION = ipData.loc;
										LAST_IP = CURRENT_IP;
									} else {
										if (ipData.loc.indexOf("192.168.") > -1) {
											LOCATION = ipData.loc;
											LAST_IP = CURRENT_IP;
										} else {
											_getGoogleMap(ipData.loc, function(err) {
												self._updateGoogleMap();
												LOCATION = ipData.loc;
												LAST_IP = CURRENT_IP;
											});
										}
									}

									map_file_path = null;
								} else {
									LOCATION = ipData.loc;
									LAST_IP = CURRENT_IP;
								}
							}
						}
					}
				});
			}
		}
	},

	_removeTimeout: function () {
		if (this._timeout) {
			Mainloop.source_remove(this._timeout);
			this._timeout = null;
		}
	},
	
	_change_Lookup_Service_URL: function (i) {
		if (i == 0) {			
			for (let m = 0; m < ARR_URL_IP.length; m++) {
				if (URL_IP == ARR_URL_IP[m]) {
					if (m == ARR_URL_IP.length-1) {
						URL_IP = ARR_URL_IP[0];
					} else {
						URL_IP = ARR_URL_IP[m+1];
					}
					break;
				}
			}
		} else {
			for (let m = 0; m < ARR_URL_CODE.length; m++) {
				if (URL_COUNTRY == ARR_URL_CODE[m]) {
					if (m == ARR_URL_CODE.length-1) {
						URL_COUNTRY = ARR_URL_CODE[0];
					} else {
						URL_COUNTRY = ARR_URL_CODE[m+1];
					}
					break;
				}
			}
		}
	},
	
	_get_ip_from_google: function() {
		IP_FROM_GOOGLE = "";
		
		let CHOOSE = "";
		if (this._checkIP.indexOf("OpenDNS") > -1) {
			CHOOSE = "";
		} else {
			CHOOSE = "1";
		}
		
		let argv = ["bash", shell_path + "/google-get-ip.sh", CHOOSE];
		let [result, output, std_err, status] = this._spawnWithPipes(argv);
		if (result) {
			if (output !== null) {
				if (output.toString().trim().length > 0) {
					let s = "";
					this._find_ip(output.toString().trim(), '"'); s = temp;
					if (s.search(IP_RE) == 0) {
						IP_FROM_GOOGLE = s;
					}
					s = null;
				}
			}
		}
		argv = null;
	},
	
	_trySpawnSyncWithPipes: function(argv) {
        let retval = [false, null, null, -1];

        try {
            retval = GLib.spawn_sync(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null, null);
        } catch (err) {
            if (err.code == GLib.SpawnError.G_SPAWN_ERROR_NOENT) {
                err.message = _("Command not found");
            } else {
                err.message = err.message.replace(/.*\((.+)\)/, '$1');
            }

            throw err;
        }
        return retval;
    },
	
	_spawnWithPipes: function(argv) {
        try {
            return this._trySpawnSyncWithPipes(argv);
        } catch (err) {
            this._handleSpawnError(argv[0], err);
            return [false, null, err.message, -1];
        }
    },
	
	_handleSpawnError: function(command, err) {
        let title = _("Execution of '%s' failed:").format(command);
        log(title);
        log(err.message);
    },
	
	stop: function () {
		if (_httpSession !== undefined) {
			_httpSession.abort();
		}
		
		_httpSession = undefined;
		
		if (this._timeout) {
			Mainloop.source_remove(this._timeout);
		}
		
		this._timeout = undefined;

		this._removeTimeout();
		this._BoxLayout.remove_all_children();
	},
	
	destroy: function () {
		this.stop();
	},
});

function _trySpawnSyncWithPipes(argv) {
	let retval = [false, null, null, -1];

	try {
		retval = GLib.spawn_sync(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null, null);
	} catch (err) {
		if (err.code == GLib.SpawnError.G_SPAWN_ERROR_NOENT) {
			err.message = _("Command not found");
		} else {
			err.message = err.message.replace(/.*\((.+)\)/, '$1');
		}

		throw err;
	}
	return retval;
}
	
function _spawnWithPipes(argv) {
	try {
		return _trySpawnSyncWithPipes(argv);
	} catch (err) {
		_handleSpawnError(argv[0], err);
		return [false, null, err.message, -1];
	}
}

function _handleSpawnError(command, err) {
	let title = _("Execution of '%s' failed:").format(command);
	log(title);
	log(err.message);
}

const DEFAULT_DATA = {
	ip: _("No Connection"),
	hostname: '',
	city: '',
	region: '',
	country: '',
	loc: '',
	org: '',
	postal: '',
};

function convertFreeGeoIP_JSON(url, ip_data) {
	if (url.indexOf("freegeoip.net/json/") > -1) {
		DEFAULT_DATA['ip']       = ip_data['ip'];
		DEFAULT_DATA['hostname'] = "";
		DEFAULT_DATA['city']     = ip_data['city'];
		DEFAULT_DATA['region']   = ip_data['region_name'];
		DEFAULT_DATA['country']  = ip_data['country_code'] + " / " + ip_data['country_name'];
		DEFAULT_DATA['loc']      = ip_data['latitude'] + "," + ip_data['longitude'];
		DEFAULT_DATA['org']      = "";
		DEFAULT_DATA['postal']   = ip_data['zip_code'];
	}
}

function _get_country_code(ip) {
	let argv = ["bash", shell_path + "/geoip-get-country-code.sh", ip];
	let [result, output, std_err, status] = this._spawnWithPipes(argv);
	if (result) {
		if (output !== null) {
			if (output.toString().trim().length > 0) {
				if (output.toString().indexOf("geoiplookup") < 0) {
					return output.toString().trim();
				}
			}
		}
	}
	argv = null;
	return "";
}

function getIPDetails_from_Local_GeoIP(ip) {
	let argv = ["bash", shell_path + "/geoip-get-info.sh", ip];
	let [result, output, std_err, status] = _spawnWithPipes(argv);
	if (result) {
		if (output !== null) {
			if (output.toString().trim().length > 0) {
				return output.toString().trim();
			}
		}
	}
	argv = null;
	return "";
}

let GeoIP_URL = 'https://ipinfo.io/';

function _getIPDetails(ip, callback) {
	// St.Clipboard.get_default().set_text(St.ClipboardType.PRIMARY, json);
	if (CURRENT_IP !== null) {
		if (CURRENT_IP !== LAST_IP) {
			let local_GeoIP = getIPDetails_from_Local_GeoIP(ip);

			if (local_GeoIP.length > 0) {
				callback(null, JSON.parse(local_GeoIP));
				return;
			} else {	
				let url = GeoIP_URL + ip;

				let _httpSession_ = new Soup.SessionAsync();
				Soup.Session.prototype.add_feature.call(_httpSession_, new Soup.ProxyResolverDefault());

				var request = Soup.Message.new('GET', url);

				_httpSession_.queue_message(request, function(_httpSession_, message) {
					if (message.status_code !== 200) {
						if (url.indexOf('ipinfo.io/') > -1) {
							GeoIP_URL = 'http://freegeoip.net/json/';
						} else {
							GeoIP_URL = 'https://ipinfo.io/';
						}
						callback(message.status_code, null);
						return;
					}

					var json = request.response_body.data;
					
					if (url.indexOf("freegeoip.net/json/") > -1) {
						convertFreeGeoIP_JSON(url, JSON.parse(json));
						callback(null, DEFAULT_DATA);
					} else {
						callback(null, JSON.parse(json));
					}
				});
			}
		}
	}
}

function _getGoogleMap(loc, callback) {
	if (CURRENT_IP !== null) {
		if (CURRENT_IP.search(IP_RE) == 0) {
			
			let map_file_path = maps_path + '/latest_map_' + CURRENT_IP + '.png';
	
			let _httpSession_ = new Soup.SessionAsync();
			Soup.Session.prototype.add_feature.call(_httpSession_, new Soup.ProxyResolverDefault());
	
			let file = Gio.file_new_for_path(map_file_path);
			let fstream = file.replace(null, false, Gio.FileCreateFlags.NONE, null);

			let request = Soup.Message.new('GET','https://maps.googleapis.com/maps/api/staticmap?center=' + loc + '&size=160x160&zoom=13&scale=2');
			
			request.connect('got_chunk', Lang.bind(this, function(message, chunk) {
				fstream.write(chunk.get_data(), null, chunk.length);
			}));

			_httpSession_.queue_message(request, function(_httpSession_, message) {
				fstream.close(null);
				callback(null);
			});
			
			map_file_path = null;
		}
	}
}

function reset_Indicator() {	
	Main.panel.statusArea['auto-ovpn']._BoxLayout.destroy_all_children();
	Main.panel.statusArea['auto-ovpn'].menu.actor.destroy_all_children();
	Main.panel.statusArea['auto-ovpn'].menu = null;
	Main.panel.statusArea['auto-ovpn'].actor.destroy_all_children();
	Main.panel.statusArea['auto-ovpn'].actor = null;
	Main.panel.statusArea['auto-ovpn'].container.destroy_all_children();
	Main.panel.statusArea['auto-ovpn'].destroy();
	Main.panel.statusArea['auto-ovpn'] = null;
	
	button = null;
	removeButtons();
	
	reset_var();
	addButtons();
}

function reset_var() {
	CURRENT_IP     = null;
	IP_FROM_GOOGLE = null;
	LST_IP         = null;
	LAST_IP        = null;
	LOCATION       = null;
	LST_COUNTRY    = null;
	URL_IP         = null;
	URL_IP_COUNTRY   = null;
	URL_COUNTRY      = null;
	RETURN_DATA      = null;
	RET_COUNTRY_CODE = null;

	_httpSession = null;

	redraw = 0;

	temp = null;
}


//let directory;
//let directoryMonitor;

let button = null;
let buttons = [];

function init() {
	/*
	let directoryPath = GLib.build_filenamev([shell_path, ""]);
	directory = Gio.File.new_for_path(directoryPath);
	directoryMonitor = directory.monitor_directory(Gio.FileMonitorFlags.WATCH_MOVES, null);
	*/
}

function addButtons() {
	/*
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
	*/
	let settings = Utilities.parseFilename("menu.sh");
	//button = new PanelMenuButton(files[0], settings.updateInterval);
	button = new PanelMenuButton(null, settings.updateInterval);
	buttons.push(button);
	
	let settings2 = Convenience.getSettings(CurrExtension.metadata['settings-schema']);
	let menuPosition = settings2.get_string(SETTINGS_POSITION);
	
	Main.panel.addToStatusArea("auto-ovpn", button, 1, menuPosition);
	// Main.panel.addToStatusArea("auto-ovpn", button, settings.position, settings.box);
}

function removeButtons() {
	for (let i = 0; i < buttons.length; i++) {
		buttons[i].destroy();
		buttons[i] = null;
	}
	buttons = [];
}

function refresh() {
}

function enable() {
	reset_var();
	addButtons();
}

function disable() {
	Main.panel.statusArea['auto-ovpn']._BoxLayout.destroy_all_children();
	Main.panel.statusArea['auto-ovpn'].menu.actor.destroy_all_children();
	Main.panel.statusArea['auto-ovpn'].menu = null;
	Main.panel.statusArea['auto-ovpn'].actor.destroy_all_children();
	Main.panel.statusArea['auto-ovpn'].actor = null;
	Main.panel.statusArea['auto-ovpn'].container.destroy_all_children();
	Main.panel.statusArea['auto-ovpn'].destroy();
	Main.panel.statusArea['auto-ovpn'] = null;
	
	button = null;
	removeButtons();
}
