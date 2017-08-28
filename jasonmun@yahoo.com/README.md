<h1 align="center">Auto OVPN</h1>
<h3 align="center">Easy to use VPN Gate on Linux (Gnome)</h3>
<br>

![Screencast](https://extensions.gnome.org/extension-data/screenshots/screenshot_1270.png)

http://jasonmun.blogspot.my/2017/08/gnome-shell-extensions-auto-ovpn.html
<br>

## Requirements

Before using Auto OVPN, <br>
we need install OpenVPN at your Gnome Network Manager and Curl for download OVPN files in backend<br><br>

#### Ubuntu / Linux Mint / Debian / Zorin OS<br>
$ sudo apt install openvpn network-manager-openvpn network-manager-openvpn-gnome curl<br>
$ sudo apt install geoip-bin geoip-database geoip-database-extra
<br>
#### Fedora<br>
$ sudo dnf install openvpn NetworkManager-openvpn NetworkManager-openvpn-gnome curl<br>
$ sudo dnf install GeoIP GeoIP-GeoLite-data GeoIP-GeoLite-data-extra
<br>
#### CentOS 7<br>
$ sudo yum install http://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm<br>
$ sudo yum install openvpn NetworkManager-openvpn NetworkManager-openvpn-gnome curl GeoIP GeoIP-data
<br>
#### OpenSUSE<br>
$ sudo zypper install openvpn NetworkManager-openvpn NetworkManager-openvpn-gnome curl GeoIP GeoIP-data
<br>
#### Antergos / Manjaro<br>
$ sudo pacman -S openvpn networkmanager-openvpn curl geoip geoip-database geoip-database-extra
<br>
#### Solus 3 (Can not install geoip)<br>
$ sudo eopkg install openvpn networkmanager-openvpn curl<br>
<br>
## Installation

### From the GNOME Shell Extensions website (recommended)
(https://extensions.gnome.org/extension/1270/auto-ovpn/)
<br><br>
or<br>
<br>
$ git clone https://github.com/yomun/auto-ovpn.git<br>
$ cd auto-ovpn<br>
$ mv jasonmun@yahoo.com ~/.local/share/gnome-shell/extensions<br>
<br>
If you use KDE, you may using Auto OVPN (Python 3)<br>
https://github.com/yomun/auto-ovpn-py<br>
<br>
## Acknowledgments

Auto OVPN includes (https://github.com/p-e-w/argos)

## License

Copyright &copy; 2017 Jason Mun (<jasonmun@yahoo.com>)

Released under the terms of the [GNU General Public License, version 3](https://gnu.org/licenses/gpl.html)

