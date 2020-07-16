<h1 align="center">Auto OVPN</h1>
<h3 align="center">Easy to use VPN Gate on Linux (Gnome)</h3>
<br>

![Screencast](https://extensions.gnome.org/extension-data/screenshots/screenshot_1355.png)

http://jasonmun.blogspot.my/2017/08/gnome-shell-extensions-auto-ovpn.html
<br>

## Requirements

Before using Auto OVPN, <br>
we need install OpenVPN at your Gnome Network Manager and Curl for download OVPN configuration files in backend<br>

- Ubuntu / Linux Mint / Debian / Zorin OS
```
$ sudo apt install openvpn network-manager-openvpn network-manager-openvpn-gnome curl
$ sudo apt install geoip-bin
```
- Fedora
```
$ sudo dnf install openvpn NetworkManager-openvpn NetworkManager-openvpn-gnome curl
$ sudo dnf install GeoIP GeoIP-GeoLite-data GeoIP-GeoLite-data-extra
```
- CentOS 7
```
$ sudo yum install http://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
$ sudo yum install openvpn NetworkManager-openvpn NetworkManager-openvpn-gnome curl GeoIP GeoIP-data
```
- OpenSUSE
```
$ sudo zypper install openvpn NetworkManager-openvpn NetworkManager-openvpn-gnome
$ sudo zypper install curl GeoIP GeoIP-data
```
- Antergos / Manjaro
```
$ sudo pacman -S openvpn networkmanager-openvpn curl geoip geoip-database geoip-database-extra
```
- Solus 3 (Can not install geoip)
```
$ sudo eopkg install openvpn networkmanager-openvpn curl
```
## Installation

### From the GNOME Shell Extensions website (recommended)
V1 (https://extensions.gnome.org/extension/1270/auto-ovpn/)<br>
V2 (https://extensions.gnome.org/extension/1355/auto-ovpn/)
<br><br>
or
```
$ git clone https://github.com/yomun/auto-ovpn.git
$ cd auto-ovpn
$ mv auto-ovpn@yahoo.com ~/.local/share/gnome-shell/extensions
```
## Acknowledgments

Argos (https://github.com/p-e-w/argos)<br>
Flags (https://github.com/gosquared/flags)<br>
Google Maps (https://www.google.com/maps)

## License

Copyright &copy; 2017 Jason Mun (<jasonmun@yahoo.com>)

Released under the terms of the [GNU General Public License, version 3](https://gnu.org/licenses/gpl.html)
