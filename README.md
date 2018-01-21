<h1 align="center">Auto OVPN</h1>
<h3 align="center">Easy to use VPN Gate on Linux (Gnome)</h3>
<br>

![Screencast](https://extensions.gnome.org/extension-data/screenshots/screenshot_1355.png)

http://jasonmun.blogspot.my/2017/08/gnome-shell-extensions-auto-ovpn.html
<br>

## Requirements

Before using Auto OVPN, <br>
we need install OpenVPN at your Gnome Network Manager and Curl for download OVPN files in backend<br>

#### Ubuntu / Linux Mint / Debian / Zorin OS<br>
$ sudo apt install openvpn network-manager-openvpn network-manager-openvpn-gnome curl bc<br>
<br>
Install GeoIP is not a must, but suggest to install..
###### GeoIP database<br>
$ sudo apt install geoip-bin geoip-database geoip-database-extra<br>
###### GeoLite database<br>
$ sudo apt install geoip-bin geoip-database-contrib
#### Fedora<br>
$ sudo dnf install openvpn NetworkManager-openvpn NetworkManager-openvpn-gnome curl bc<br>
$ sudo dnf install GeoIP GeoIP-GeoLite-data GeoIP-GeoLite-data-extra
<br>
#### CentOS 7<br>
$ sudo yum install http://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm<br>
$ sudo yum install openvpn NetworkManager-openvpn NetworkManager-openvpn-gnome curl bc GeoIP GeoIP-data
<br>
#### OpenSUSE<br>
$ sudo zypper install openvpn NetworkManager-openvpn NetworkManager-openvpn-gnome curl bc GeoIP GeoIP-data
<br>
#### Antergos / Manjaro<br>
$ sudo pacman -S openvpn networkmanager-openvpn curl bc geoip geoip-database geoip-database-extra
<br>
#### Solus 3 (Can not install geoip)<br>
$ sudo eopkg install openvpn networkmanager-openvpn curl bc<br>
<br>
## Installation

### From the GNOME Shell Extensions website (recommended)
(https://extensions.gnome.org/extension/1355/auto-ovpn/)
<br><br>
or<br>
<br>
$ git clone https://github.com/yomun/auto-ovpn.git<br>
$ cd auto-ovpn<br>
$ mv auto-ovpn@yahoo.com ~/.local/share/gnome-shell/extensions<br>
<br>
## Acknowledgments

Argos (https://github.com/p-e-w/argos)<br>
IP-Finder (https://github.com/LinxGem33/IP-Finder)<br>
Flags (https://github.com/gosquared/flags)<br>
Google Maps (https://www.google.com/maps)

## License

Copyright &copy; 2017 Jason Mun (<jasonmun@yahoo.com>)

Released under the terms of the [GNU General Public License, version 3](https://gnu.org/licenses/gpl.html)
