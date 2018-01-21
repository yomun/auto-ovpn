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
#-----------------------------------------------
# Stop & delete VPNGate from Network Manager
#-----------------------------------------------

FOLDER="ovpn"

FILE_TYPE=".ovpn"

SHELL_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DATA_PATH=`echo "${SHELL_PATH}" | sed -e 's/\/sh$//'`

PFOLDER="${DATA_PATH}/${FOLDER}"

#-----------------------------------------------
# Delete all of Active VPN/OVPN
#-----------------------------------------------
ACTIVE_VPNGATE_LIST=`nmcli con show --active | grep ' vpn ' | awk '{print $1}' | tr "\n" " "`

# vpn_name = vpngate_{IP}_{PROTOCOL}_{PORT}
for vpn_name in ${ACTIVE_VPNGATE_LIST}
do
	pOVPN="${PFOLDER}/${vpn_name}${FILE_TYPE}"
		
	rm -rf ${pOVPN}
		
	nmcli con down ${vpn_name}
	nmcli con delete ${vpn_name}
done

# sudo nmcli con reload
