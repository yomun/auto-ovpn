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

const Lang  = imports.lang;
const Gio   = imports.gi.Gio;
const GLib  = imports.gi.GLib;
const Shell = imports.gi.Shell;
const Soup  = imports.gi.Soup;
const St    = imports.gi.St;
const Main        = imports.ui.main;
const PanelMenu   = imports.ui.panelMenu;
const PopupMenu   = imports.ui.popupMenu;
const Mainloop    = imports.mainloop;
const ExtensionUtils = imports.misc.extensionUtils;
const CurrExtension  = ExtensionUtils.getCurrentExtension();
const BoxLayout      = CurrExtension.imports.boxlayout.BoxLayout;
const Convenience    = CurrExtension.imports.convenience;
const MenuItem       = CurrExtension.imports.menuitem.MenuItem;
const Utilities      = CurrExtension.imports.utilities;
const Metadata       = CurrExtension.metadata;

const SETTINGS_WIFI_MODE    = 'wifi-mode';
const SETTINGS_COMPACT_MODE = 'compact-mode';
const SETTINGS_REFRESH_RATE = 'refresh-rate';
const SETTINGS_POSITION     = 'position-in-panel';
const SETTINGS_COUNTRY_CODE = 'country-code';

const MAP_SIZE = 150;

const IP_RE = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

const IP_RE_IN_STR = /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/

const CD_RE = /^([a-z][a-z])$/

const HTML_TAGS_RE = /<[^>]*>/g

// const NOT_CONNECTED = "Not Connected";
const NOT_CONNECTED = "Auto OVPN";

const DEFAULT_COUNTRY_CODE = "icon"

const DEFAULT_LOOP_SEC = 15;

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

// let _Schema = null;

let LOOP_SEC = DEFAULT_LOOP_SEC;

let redraw = 0;

let temp = null;

let DEFAULT_ICON_SIZE = 20;

let DEBUG = false;

const PanelMenuButton = new Lang.Class({
	Name: "PanelMenuButton",
	Extends: PanelMenu.Button,

	_init: function(file, updateInterval) {
		this.parent(0, "", false);
		
		this._textureCache = St.TextureCache.get_default();
		
		this._settings = Convenience.getSettings(CurrExtension.metadata['settings-schema']);

		this.setPrefs();
		
		// this._timeout = LOOP_SEC;
		
		//_Schema = Convenience.getSettings();
		//ARR_URL_IP.push(_Schema.get_string('ip-lookup-service').trim());
		
		ARR_URL_IP.push("http://ipinfo.io/ip");
		ARR_URL_IP.push("http://checkip.dyndns.com/");
		ARR_URL_IP.push("http://checkip.dyndns.org/");
		ARR_URL_IP.push("http://checkip.dyn.com/");
		ARR_URL_IP.push("http://icanhazip.com/");
		ARR_URL_IP.push("http://ipecho.net/plain");
		ARR_URL_IP.push("https://l2.io/ip.js?var=myip");
		ARR_URL_IP.push("https://api.ipify.org?format=jsonp&callback=getIP");
		ARR_URL_IP.push("https://api.userinfo.io/userinfos");
		
		// ARR_URL_IP.push("http://checkmyip.com/");
		
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
		
		ARR_URL_CODE.push("http://ipinfo.io/");
		ARR_URL_CODE.push("https://ipapi.co/");
		ARR_URL_CODE.push("https://db-ip.com/");
		ARR_URL_CODE.push("http://getcitydetails.geobytes.com/GetCityDetails?fqcn=");
		ARR_URL_CODE.push("https://www.geoip-db.com/json/");
		ARR_URL_CODE.push("http://freegeoip.net/json/");
		ARR_URL_CODE.push("http://geoip.nekudo.com/api/");
		
		URL_COUNTRY = ARR_URL_CODE[0];
		
		// Maps + IP Info
		let ipInfoBox = new St.BoxLayout({style_class: 'ip-info-box', vertical: true});
		
		this._mapBox = new St.BoxLayout();
		this._mapBox.add_actor(new St.Icon({gicon: Gio.icon_new_for_string(CurrExtension.path + '/default_map.png'), icon_size: MAP_SIZE}));
		
		let boxLayout = new St.BoxLayout();
		boxLayout.add_actor(this._mapBox);
		boxLayout.add_actor(ipInfoBox);
		
		let ipInfoPopupMenuItem = new PopupMenu.PopupMenuItem(""); // new PopupMenu.PopupBaseMenuItem({reactive: false});
		ipInfoPopupMenuItem.actor.add(boxLayout);
		
		ipInfoPopupMenuItem.connect('activate', function() {
			if (LOCATION != null) {
				GEOIP_OK = true;
				let link = 'https://www.google.com/maps/place/' + LOCATION;
				let argv = ["xdg-open", link];
				GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null);
				argv = null; link = null;
			}
		});
		
		this.menu.addMenuItem(ipInfoPopupMenuItem);
		
		boxLayout = null; ipInfoPopupMenuItem = null;

		this._putIPDetails(ipInfoBox);
		
		let self = this;

		// Preferences
		let _appSys = Shell.AppSystem.get_default();
		let _gsmPrefs = _appSys.lookup_app('gnome-shell-extension-prefs.desktop');

		let prefs;

		prefs = new PopupMenu.PopupMenuItem(_(" Preferences..."));

		prefs.connect('activate', function() {
			if (_gsmPrefs.get_state() == _gsmPrefs.SHELL_APP_STATE_RUNNING) {
				_gsmPrefs.activate();
			} else {
				let info = _gsmPrefs.get_app_info();
				let timestamp = global.display.get_current_time_roundtrip();
				info.launch_uris([Metadata.uuid], global.create_app_launch_context(timestamp, -1));
				info = null; timestamp = null;
				
				let argv = ["bash", CurrExtension.path + "/sh/stop-vpngate.sh"];
				GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null);
				argv = null; link = null;
			}
		});
		
		this.menu.addMenuItem(prefs);
		
		_appSys = null; prefs = null;
		
		// Delete all of VPN
		let popupMenuItem = new PopupMenu.PopupMenuItem('');
		let boxLayout1 = new St.BoxLayout();
		let boxLayout2 = new St.BoxLayout();
		boxLayout2.add_actor(new St.Icon({ style_class: 'popup-menu-icon', icon_name: 'edit-clear', icon_size: DEFAULT_ICON_SIZE }));
		boxLayout2.add_actor(new St.Label({ text: _(" Delete all of VPN") }));
		boxLayout1.add_actor(boxLayout2);
		popupMenuItem.actor.add(boxLayout1);
		this.menu.addMenuItem(popupMenuItem);
		popupMenuItem.connect('activate', function() {
			if (DEBUG) {
				Main.notify("Delete all of VPN");
			} else {
				let argv = ["bash", CurrExtension.path + "/sh/del-vpngate.sh"];
				GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null);
				argv = null;
			}
		});
		popupMenuItem = null; boxLayout1 = null; boxLayout2 = null;
		
		// Start / Stop VPN + WIFI
		if (this._wifiMode) {
			let popupMenuItem = new PopupMenu.PopupMenuItem('');
			let boxLayout1 = new St.BoxLayout();
			let boxLayout2 = new St.BoxLayout();
			boxLayout2.add_actor(new St.Icon({ style_class: 'popup-menu-icon', icon_name: 'media-playback-start', icon_size: DEFAULT_ICON_SIZE }));
			boxLayout2.add_actor(new St.Label({ text: _(" Start / Stop VPN+WIFI") }));
			boxLayout1.add_actor(boxLayout2);
			popupMenuItem.actor.add(boxLayout1);
			this.menu.addMenuItem(popupMenuItem);
			popupMenuItem.connect('activate', function() {
				if (DEBUG) {
					Main.notify("VPN + WIFI");
				} else {
					let MODE = "";
					let CODE = "";
					if (self._wifiMode)             { MODE = "wifi"; } else { MODE = ""; }
					if (self._countryCode == "ALL") { CODE = "";     } else { CODE = self._countryCode; }
					let argv = ["bash", CurrExtension.path + "/sh/start-vpngate.sh", MODE, CODE];
					// Main.notify(argv[0]+"\r\n"+argv[1].substring(50)+"\r\n"+argv[2]+"\r\n"+argv[3]);
					GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null);
					argv = null;
				}
			});
			popupMenuItem = null; boxLayout1 = null; boxLayout2 = null;
		} else {
			let popupMenuItem = new PopupMenu.PopupMenuItem('');
			let boxLayout1 = new St.BoxLayout();
			let boxLayout2 = new St.BoxLayout();
			boxLayout2.add_actor(new St.Icon({ style_class: 'popup-menu-icon', icon_name: 'media-playback-start', icon_size: DEFAULT_ICON_SIZE }));
			boxLayout2.add_actor(new St.Label({ text: _(" Start / Stop VPN") }));
			boxLayout1.add_actor(boxLayout2);
			popupMenuItem.actor.add(boxLayout1);
			this.menu.addMenuItem(popupMenuItem);
			popupMenuItem.connect('activate', function() {
				if (DEBUG) {
					Main.notify("VPN");
				} else {
					let CODE = "";
					if (self._countryCode == "ALL") { CODE = ""; } else { CODE = self._countryCode; }
					let argv = ["bash", CurrExtension.path + "/sh/start-vpngate.sh", CODE];
					GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null);
					argv = null;
				}
			});
			popupMenuItem = null; boxLayout1 = null; boxLayout2 = null;
		}
		
		// Change VPN
		let popupMenuItem4 = new PopupMenu.PopupMenuItem('');
		let boxLayout41 = new St.BoxLayout();
		let boxLayout42 = new St.BoxLayout();
		boxLayout42.add_actor(new St.Icon({ style_class: 'popup-menu-icon', icon_name: 'media-skip-forward', icon_size: DEFAULT_ICON_SIZE }));
		boxLayout42.add_actor(new St.Label({ text: _(" Change VPN") }));
		boxLayout41.add_actor(boxLayout42);
		popupMenuItem4.actor.add(boxLayout41);
		this.menu.addMenuItem(popupMenuItem4);
		popupMenuItem4.connect('activate', function() {
			if (DEBUG) {
				Main.notify("Change VPN");
			} else {
				let argv = ["bash", CurrExtension.path + "/sh/edit-vpngate.sh"];
				GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null);
				argv = null;
			}
		});
		popupMenuItem4 = null; boxLayout41 = null; boxLayout42 = null;
		
		this._file = file;

		if (this._BoxLayout == null) {
			this._BoxLayout = new BoxLayout();
			this.actor.add_actor(this._BoxLayout);
			// this._update();
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
			} else {
				if (_(key) == 'loc') {
					ipInfoRow.add_actor(new St.Label({style_class: 'ip-info-key', text: 'location : '}));
				} else if(_(key) == 'org') {
					ipInfoRow.add_actor(new St.Label({style_class: 'ip-info-key', text: 'organization : '}));
				} else {
					ipInfoRow.add_actor(new St.Label({style_class: 'ip-info-key', text: _(key) + ' : '}));
				}
			}
			
			if (DEFAULT_DATA[key] == '') {
				if (_(key) != 'hostname') { 
					this['_' + key] = new St.Label({style_class: 'ip-info-value', text: '-'});
				} else {
					this['_' + key] = new St.Label({style_class: 'ip-info-value', text: DEFAULT_DATA[key]});
				}
			} else {
				this['_' + key] = new St.Label({style_class: 'ip-info-value', text: DEFAULT_DATA[key]});
			}
				
			ipInfoRow.add_actor(this['_' + key]);
		});
	},
	
	setPrefs: function() {
		this._prevWifiMode     = this._wifiMode;
    	this._prevCompactMode  = this._compactMode;
    	this._prevRefreshRate  = this._refreshRate;
		this._prevMenuPosition = this._menuPosition;
		this._prevCountryCode  = this._countryCode;

		this._wifiMode     = this._settings.get_boolean(SETTINGS_WIFI_MODE);
		this._compactMode  = this._settings.get_boolean(SETTINGS_COMPACT_MODE);
		this._refreshRate  = this._settings.get_int(SETTINGS_REFRESH_RATE);
		this._menuPosition = this._settings.get_string(SETTINGS_POSITION);
		this._countryCode  = this._settings.get_string(SETTINGS_COUNTRY_CODE);
	},

	_update: function() {
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
	},
	
	_refresh: function () {
		this.setPrefs();
		this._loadData();
		this._removeTimeout();
		this._timeout = Mainloop.timeout_add_seconds(LOOP_SEC, Lang.bind(this, this._refresh));
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
			let DIG_OK = false;
			
			this._get_ip_from_google();
			
			if (IP_FROM_GOOGLE.length > 0) {
				CURRENT_IP = IP_FROM_GOOGLE;
				LST_IP = CURRENT_IP;
				this._soup_data(1, CURRENT_IP);
				DIG_OK = true;
			}
			
			// Use it get Public IP by using SOUP
			if (DIG_OK == false) {
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
						}
					
						RETURN_DATA = "";
					
						if (LST_COUNTRY == null) LST_COUNTRY = "";
					
						let resume = false;
						if (CURRENT_IP.length > 0) {
							if (LST_IP !== CURRENT_IP) {
								LST_IP = CURRENT_IP;
								resume = true;
							
								// Use it get Country Code, if got install geoip-bin
								let GEOIP_OK = false;
							
								let argv = ["bash", CurrExtension.path + "/sh/geoip-get-country-code.sh", CURRENT_IP];
								let [result, output, std_err, status] = this._spawnWithPipes(argv);
								if (result) {
									if (output !== null) {
										if (output.toString().trim().length > 0) {
											if (output.toString().indexOf("geoiplookup") < 0) {
												let CODE = output.toString().trim();
												if (CODE.length == 2) {
													LST_COUNTRY = CODE;
													this._BoxLayout.setPanelLine(CURRENT_IP, CODE);
													LOOP_SEC = DEFAULT_LOOP_SEC;
													resume = false;
												} else {
													this._BoxLayout.setPanelLine(NOT_CONNECTED, DEFAULT_COUNTRY_CODE);
												}
												GEOIP_OK = true;
											}
										}
									}
								}
							
							} else {
								++redraw;
								if (redraw == 1) {
									if ((CURRENT_IP.length > 0) && (LST_COUNTRY.length == 2)) {
										this._BoxLayout.setPanelLine(CURRENT_IP, LST_COUNTRY);
										LOOP_SEC = DEFAULT_LOOP_SEC;
									}
									if (redraw == 1) { redraw = 0; }
								}
							}
						}

						if (resume == true) {
							if (RET_COUNTRY_CODE == null) {
								RET_COUNTRY_CODE = "";
							}
							if (RET_COUNTRY_CODE.length == 2) {
								LST_COUNTRY = RET_COUNTRY_CODE;
								this._BoxLayout.setPanelLine(CURRENT_IP, LST_COUNTRY);
								LOOP_SEC = DEFAULT_LOOP_SEC;
							} else {							
								this._soup_data(1, CURRENT_IP);
							}
						
							RET_COUNTRY_CODE = null;
						}
					}
				}));
				message = null;
			}
			
		} else {
			
			this._url_add_ip();
			
			// Use it get Country Code, if got install geoip-bin
			let GEOIP_OK = false;
			
			let argv = ["bash", CurrExtension.path + "/sh/geoip-get-country-code.sh", CURRENT_IP];
			let [result, output, std_err, status] = this._spawnWithPipes(argv);
			if (result) {
				if (output !== null) {
					if (output.toString().trim().length > 0) {
						if (output.toString().indexOf("geoiplookup") < 0) {
							let CODE = output.toString().trim();
							if (CODE.length == 2) {
								LST_COUNTRY = CODE;
								this._BoxLayout.setPanelLine(CURRENT_IP, CODE);
								LOOP_SEC = DEFAULT_LOOP_SEC;
								resume = false;
							} else {
								this._BoxLayout.setPanelLine(NOT_CONNECTED, DEFAULT_COUNTRY_CODE);
							}
							GEOIP_OK = true;
						}
					}
				}
			}
			
			// Use it get Country Code by using SOUP
			if (GEOIP_OK == false) {
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
								LST_COUNTRY = CODE;
								this._BoxLayout.setPanelLine(CURRENT_IP, CODE);
								LOOP_SEC = DEFAULT_LOOP_SEC;
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
		let scaleFactor = St.ThemeContext.get_for_stage(global.stage).scale_factor;

		this._mapBox.destroy_all_children();
		
		if (CURRENT_IP != null) {
			if (CURRENT_IP.search(IP_RE) == 0) {
			
				map_file_path = CurrExtension.path + '/maps/latest_map_' + CURRENT_IP + '.png';
		
				if (GLib.file_test (map_file_path, GLib.FileTest.EXISTS)) {
					if (parseFloat(Convenience.getVersion()) < 3.16) {
						this._mapBox.add_child(this._textureCache.load_uri_async(Gio.file_new_for_path(map_file_path).get_uri(), -1, MAP_SIZE, scaleFactor));
					} else {
						this._mapBox.add_child(this._textureCache.load_file_async(Gio.file_new_for_path(map_file_path), -1, MAP_SIZE, scaleFactor));
					}
				}
			}
		}
	},
	
	_loadData: function () {
		this._soup_data(0, "");

		if (CURRENT_IP != null) {
			if (CURRENT_IP != LAST_IP) {
				let self = this;
				_getIPDetails(CURRENT_IP, function(err, ipData) {
					if (ipData) {					
						if (CURRENT_IP == ipData.ip) {
							if (CURRENT_IP.search(IP_RE) == 0) {
							
								this['_postal'].text = '-';
							
								Object.keys(ipData).map(function(key) {
									if ((ipData[key] == '') || (ipData[key] == '-')) {
										this['_' + key].text = '-';
									} else {
										this['_' + key].text = ipData[key];
									}
								});
						
								_getGoogleMap(ipData.loc, function(err) { self._updateGoogleMap(); });
								
								self._updateGoogleMap();
								
								LOCATION = ipData.loc;
							}
						}
					}
				});
				LAST_IP = CURRENT_IP;
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
		
		let argv = ["bash", CurrExtension.path + "/sh/google-get-ip.sh"];
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
	
	_trySpawnWithPipes: function(argv) {
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
            return this._trySpawnWithPipes(argv);
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
		if (_httpSession !== undefined)
			_httpSession.abort();
		
		_httpSession = undefined;
		/*
		if (this._timeout)
			Mainloop.source_remove(this._timeout);
		
		this._timeout = undefined;
		*/
		// this._removeTimeout();
		this._BoxLayout.remove_all_children();
	},
	
	destroy: function () {
		this.stop();
	},
});

function _change_LOOP_SEC(n) {
	if (n < 100) {
			LOOP_SEC = n;
		} else {
			LOOP_SEC = DEFAULT_LOOP_SEC;
		}
}

function _getIPDetails(ipAddr, callback) {
	let _httpSession_ = new Soup.SessionAsync();
	Soup.Session.prototype.add_feature.call(_httpSession_, new Soup.ProxyResolverDefault());

	var request = Soup.Message.new('GET', 'https://ipinfo.io/' + ipAddr);

	_httpSession_.queue_message(request, function(_httpSession_, message) {
		if (message.status_code !== 200) {
			callback(message.status_code, null);
			return;
		}

		var ipDetailsJSON = request.response_body.data;
		var ipDetails = JSON.parse(ipDetailsJSON);		
		callback(null, ipDetails);
	});
}

function _getGoogleMap(loc, callback) {
	if (CURRENT_IP != null) {
		if (CURRENT_IP.search(IP_RE) == 0) {
			
			let map_file_path = CurrExtension.path + '/maps/latest_map_' + CURRENT_IP + '.png';
	
			if (GLib.file_test (map_file_path, GLib.FileTest.EXISTS)) {
			} else {
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
			}
			
			map_file_path = null;
		}
	}
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
