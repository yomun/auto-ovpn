#!/usr/bin/env bash
#
# Auto OVPN gnome extension
# https://jasonmun.blogspot.my
# https://github.com/yomun/auto-ovpn
# 
# Copyright (C) 2017 Jason Mun
# 
# Auto OVPN gnome extension is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# Auto OVPN gnome extension is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with Auto OVPN gnome extension.  If not, see <http://www.gnu.org/licenses/>.
# 

id=0

ARRAY=()

os_release=`cat /etc/os-release`

# sudo apt install openvpn network-manager-openvpn network-manager-openvpn-gnome curl
# sudo apt install geoip geoip-database geoip-database-extra

if [ `echo ${os_release} | grep -c "ubuntu"` -gt 0 ] || [ `echo ${os_release} | grep -c "linuxmint"` -gt 0 ] || [ `echo ${os_release} | grep -c "debian"` -gt 0 ] || [ `echo ${os_release} | grep -c "zorin"` -gt 0 ]
then
	id=0
	
	cnt=`apt list --installed | grep -c "^curl/"`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('curl'); fi
	
	cnt=`apt list --installed | grep -c "^openvpn/"`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('openvpn'); fi
	
	cnt=`apt list --installed | grep -c "^network-manager-openvpn/"`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('network-manager-openvpn'); fi
	
	cnt=`apt list --installed | grep -c "^network-manager-openvpn-gnome/"`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('network-manager-openvpn-gnome'); fi
	
	cnt=`apt list --installed | grep -c "^geoip-bin/"`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('geoip-bin'); fi
	
	cnt=`apt list --installed | grep -c "^geoip-database/"`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('geoip-database'); fi
	
	cnt=`apt list --installed | grep -c "^geoip-database-extra/"`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('geoip-database-extra'); fi
fi

# sudo dnf install openvpn NetworkManager-openvpn NetworkManager-openvpn-gnome curl
# sudo dnf install GeoIP GeoIP-GeoLite-data GeoIP-GeoLite-data-extra

if [ `echo ${os_release} | grep -c "fedora"` -gt 0 ]
then
	id=1
	
	cnt=`dnf list installed | grep -c "^curl."`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('curl'); fi
	
	cnt=`dnf list installed | grep -c "^openvpn."`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('openvpn'); fi
	
	cnt=`dnf list installed | grep -c "^NetworkManager-openvpn."`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('NetworkManager-openvpn'); fi
	
	cnt=`dnf list installed | grep -c "^NetworkManager-openvpn-gnome."`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('NetworkManager-openvpn-gnome'); fi
	
	cnt=`dnf list installed | grep -c "^GeoIP."`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('GeoIP'); fi
	
	cnt=`dnf list installed | grep -c "^GeoIP-GeoLite-data."`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('GeoIP-GeoLite-data'); fi
	
	cnt=`dnf list installed | grep -c "^GeoIP-GeoLite-data-extra."`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('GeoIP-GeoLite-data-extra'); fi
fi

# sudo yum install epel-release openvpn NetworkManager-openvpn NetworkManager-openvpn-gnome curl GeoIP GeoIP-data

if [ `echo ${os_release} | grep -c "centos"` -gt 0 ]
then
	id=2
	
	cnt=`yum list installed | grep -c "^epel-release."`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('epel-release'); fi
	
	cnt=`yum list installed | grep -c "^curl."`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('curl'); fi
	
	cnt=`yum list installed | grep -c "^openvpn."`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('openvpn'); fi
	
	cnt=`yum list installed | grep -c "^NetworkManager-openvpn."`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('NetworkManager-openvpn'); fi
	
	cnt=`yum list installed | grep -c "^NetworkManager-openvpn-gnome."`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('NetworkManager-openvpn-gnome'); fi
	
	cnt=`yum list installed | grep -c "^GeoIP."`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('GeoIP'); fi
	
	cnt=`yum list installed | grep -c "^GeoIP-data."`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('GeoIP-data'); fi
fi

# sudo zypper install openvpn NetworkManager-openvpn NetworkManager-openvpn-gnome curl GeoIP GeoIP-data

if [ `echo ${os_release} | grep -c "opensuse"` -gt 0 ]
then
	id=3
	
	cnt=`rpm -qa | grep -c "^curl"`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('curl'); fi
	
	cnt=`rpm -qa | grep -c "^openvpn"`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('openvpn'); fi
	
	cnt=`rpm -qa | grep -c "^NetworkManager-openvpn"`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('NetworkManager-openvpn'); fi
	
	cnt=`rpm -qa | grep -c "^NetworkManager-openvpn-gnome"`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('NetworkManager-openvpn-gnome'); fi
	
	cnt=`rpm -qa | grep -c "^GeoIP"`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('GeoIP'); fi
	
	cnt=`rpm -qa | grep -c "^GeoIP-data"`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('GeoIP-data'); fi
fi

# sudo pacman -S openvpn networkmanager-openvpn curl geoip geoip-database geoip-database-extra 

if [ `echo ${os_release} | grep -c "manjaro"` -gt 0 ] || [ `echo ${os_release} | grep -c "antergos"` -gt 0 ]
then
	id=4
	
	cnt=`pacman -Q | grep -c "^curl "`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('curl'); fi
	
	cnt=`pacman -Q | grep -c "^openvpn "`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('openvpn'); fi
	
	cnt=`pacman -Q | grep -c "^networkmanager-openvpn "`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('networkmanager-openvpn'); fi
	
	cnt=`pacman -Q | grep -c "^geoip "`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('geoip'); fi
	
	cnt=`pacman -Q | grep -c "^geoip-database "`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('geoip-database'); fi
	
	cnt=`pacman -Q | grep -c "^geoip-database-extra "`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('geoip-database-extra'); fi
fi

# sudo eopkg install openvpn networkmanager-openvpn curl

if [ `echo ${os_release} | grep -c "solus"` -gt 0 ]
then
	id=5
	
	cnt=`eopkg list-installed | grep -c "^curl "`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('curl'); fi
	
	cnt=`eopkg list-installed | grep -c "^openvpn "`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('openvpn'); fi
	
	cnt=`eopkg list-installed | grep -c "^networkmanager-openvpn "`
	if [ ${cnt} -lt 1 ]; then ARRAY+=('networkmanager-openvpn'); fi
fi

if [ ${#ARRAY[@]} -gt 0 ]
then
	msg=""

	if [ ${id} -eq 0 ]; then msg="sudo apt install ${ARRAY[@]}"; fi
	if [ ${id} -eq 1 ]; then msg="sudo dnf install ${ARRAY[@]}"; fi
	if [ ${id} -eq 2 ]; then msg="sudo yum install ${ARRAY[@]}"; fi
	if [ ${id} -eq 3 ]; then msg="sudo zypper install ${ARRAY[@]}"; fi
	if [ ${id} -eq 4 ]; then msg="sudo pacman -S ${ARRAY[@]}"; fi
	if [ ${id} -eq 5 ]; then msg="sudo eopkg install ${ARRAY[@]}"; fi
	
	SHELL_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
	
	DATA_PATH=`echo "${SHELL_PATH}" | sed -e 's/\/sh$//'`

	notify-send -i "${DATA_PATH}/icon.png" "Some packages you need to install.." "${msg}"
fi
