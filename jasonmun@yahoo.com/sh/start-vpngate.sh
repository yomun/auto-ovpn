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
##################################################
# every ${MAX_SECONDS} to check VPN is connected
##################################################

FOLDER="ovpn"

FILE_TYPE=".ovpn"

SHELL_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DATA_PATH=`echo "${SHELL_PATH}" | sed -e 's/\/sh$//'`

PFOLDER="${DATA_PATH}/${FOLDER}"

CLEAN_SHELL="${SHELL_PATH}/clean-vpngate.sh"

ADD_SHELL="${SHELL_PATH}/add-vpngate.sh"

MAX_SECONDS=15

WIFI_MODE=""
DEFAULT_COUNTRY_CODE=""

if [ "${1}" = "wifi" ] || [ "${2}" = "wifi" ]
then
	if [ ${1} == 'wifi' ]
	then
		WIFI_MODE="wifi"
		DEFAULT_COUNTRY_CODE="${2}"
	elif [ ${2} == 'wifi' ]
	then
		WIFI_MODE="wifi"
		DEFAULT_COUNTRY_CODE="${1}"
	else
		WIFI_MODE=""
		DEFAULT_COUNTRY_CODE=""
	fi
else
	DEFAULT_COUNTRY_CODE="${1}"
fi

# echo "[MODE] " ${WIFI_MODE}
# echo "[CODE] " ${DEFAULT_COUNTRY_CODE}

function check_VPN()
{
	local i=1

	while [ $i -gt 0 ]
	do
		connected=`nmcli con show --active | grep -c ' vpn '`
		
		if [ "$connected" = "1" ]
		then
			sleep ${MAX_SECONDS}
			continue
		else
			VPN_LIST=`nmcli con show | grep ' vpn ' | awk '{print $1}' | tr "\n" " "`
    
			if [ "$VPN_LIST" != "" ]
			then
				connect_VPN
			else
				# clean VPN
				bash ${CLEAN_SHELL}
				# insert to VPN, keep OVPN
				bash ${ADD_SHELL} ${DEFAULT_COUNTRY_CODE}
			fi
		fi
	done
}

function connect_VPN()
{
	for vpn_name in $VPN_LIST
	do
		# connect..
		try_conn=`nmcli con up ${vpn_name}`

		if [ "${try_conn}" != "${conn_vpn/VPN connection successfully activated /}" ]
		then
			# Success
			notify-send -i "${DATA_PATH}/icon.png" "${vpn_name}" "VPN connection successfully activated."
			break
		else
			# Not success				
			rm -rf ${PFOLDER}/${vpn_name}${FILE_TYPE}
			
			nmcli con delete ${vpn_name}
		fi
	done
}

nmcli radio wifi on

total_vpn_active=`nmcli con show --active | grep -c ' vpn '`

if [ "${total_vpn_active}" = "0" ]
then
	# clean VPN
	bash ${CLEAN_SHELL}
	
	# insert to VPN, keep OVPN
	bash ${ADD_SHELL} ${DEFAULT_COUNTRY_CODE}

	check_VPN
else
	if [ "${WIFI_MODE}" = "wifi" ]
	then
		notify-send -i "${DATA_PATH}/icon.png" "Auto OVPN" "WIFI connection is closed.."
		nmcli radio wifi off
	fi
	
	bash "${SHELL_PATH}/stop-vpngate.sh"
fi
