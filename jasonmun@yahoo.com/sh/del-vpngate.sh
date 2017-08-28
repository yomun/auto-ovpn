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
###############################################
# delete inactive VPNGate from Network Manager
###############################################

FOLDER="ovpn"

FILE_TYPE=".ovpn"

FILE_TYPE_REM=".vpn"

FILE_PREFIX="vpngate_"

SHELL_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DATA_PATH=`echo "${SHELL_PATH}" | sed -e 's/\/sh$//'`

PFOLDER="${DATA_PATH}/${FOLDER}"

POVPN_PATTERN="${PFOLDER}/${FILE_PREFIX}*${FILE_TYPE}"

# delete all of OVPN / VPN
function del_all_OVPN_VPN()
{	
	rename -v "s/${FILE_TYPE}\$/${FILE_TYPE_REM}/" ${PFOLDER}/*${FILE_TYPE}
	
	sleep 1

	VPNGATE_LIST=`nmcli con show | grep ' vpn ' | grep '^vpngate_' | awk '{print $1}' | tr "\n" " "`

	for vpn_name in ${VPNGATE_LIST}
	do
		nmcli con down ${vpn_name}
		nmcli con delete ${vpn_name}
	done

	notify-send -i "${DATA_PATH}/icon.png" "Auto OVPN" "All of VPN Connection successfully deleted."	
	sleep 1
}

del_all_OVPN_VPN

if [ "${RUN_SUDO}" = "yes" ]
then
	sudo nmcli con reload
fi
