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

# DESKTOP=`gnome-shell --version | grep -c "GNOME Shell "`

INPUT_STR_1="${1}"
INPUT_STR_2="${2}"

FOLDER="ovpn"

FILE_TYPE=".ovpn"

SHELL_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DATA_PATH=`echo "${SHELL_PATH}" | sed -e 's/\/sh$//'`

PFOLDER="${DATA_PATH}/${FOLDER}"

CLEAN_SHELL="${SHELL_PATH}/clean-vpngate.sh"

ADD_SHELL="${SHELL_PATH}/add-vpngate.sh"

MAX_SECONDS=20

INPUT_WIFI_MODE=""
INPUT_COUNTRY_CODE=""

if [ "${INPUT_STR_1}" == "wifi" ] || [ "${INPUT_STR_2}" == "wifi" ]
then
	if [ "${INPUT_STR_1}" == "wifi" ]
	then
		INPUT_WIFI_MODE="wifi"; INPUT_COUNTRY_CODE="${INPUT_STR_2}"
	elif [ "${INPUT_STR_2}" == "wifi" ]
	then
		INPUT_WIFI_MODE="wifi"; INPUT_COUNTRY_CODE="${INPUT_STR_1}"
	else
		INPUT_WIFI_MODE=""; INPUT_COUNTRY_CODE=""
	fi
else
	INPUT_COUNTRY_CODE="${INPUT_STR_1}"
fi

# ---------------------------------------------------------
# Check VPN every ${MAX_SECONDS}
# ---------------------------------------------------------
function check_VPN()
{
	local i=1

	while [ $i -gt 0 ]
	do
		connected=`nmcli con show --active | grep -c ' vpn '`
		
		if [ "$connected" == "1" ]
		then
			sleep ${MAX_SECONDS}
			continue
		else
			VPN_LIST=""

			# Consider using COUNTRY CODE that I choose first
			if [ ${#INPUT_COUNTRY_CODE} -gt 0 ]
			then
				VPN_INPUT_COUNTRY_CODE_LIST=`nmcli con show | grep ' vpn ' | awk '{print $1}' | grep "vpngate_${INPUT_COUNTRY_CODE}_" | tr "\n" " "`

				if [ ${#VPN_INPUT_COUNTRY_CODE_LIST} -gt 0 ]
				then
					VPN_LIST=${VPN_INPUT_COUNTRY_CODE_LIST}
				else
					VPN_LIST=`nmcli con show | grep ' vpn ' | awk '{print $1}' | tr "\n" " "`
				fi
			else
				VPN_LIST=`nmcli con show | grep ' vpn ' | awk '{print $1}' | tr "\n" " "`
			fi
    
			if [ ${#VPN_LIST} -gt 0 ]
			then
				connect_VPN
			else
				# Check NO any active VPN & VPN Settings at Network Manager

				# Clear VPN
				bash ${CLEAN_SHELL}

				# insert to VPN, keep OVPN
				bash ${ADD_SHELL} ${INPUT_COUNTRY_CODE}
			fi
		fi
	done
}

# ---------------------------------------------------------
# Try connect VPN
# ---------------------------------------------------------
function connect_VPN()
{
	for vpn_name in $VPN_LIST
	do
		# connect..
		try_conn=`nmcli con up ${vpn_name}`

		if [ "${try_conn}" != "${conn_vpn/VPN connection successfully activated /}" ]
		then
			# Success
			MSG=`notify-send -i "${DATA_PATH}/icon.png" "${vpn_name}" "VPN connection successfully activated."`
			break
		else
			# Not success				
			rm -rf ${PFOLDER}/${vpn_name}${FILE_TYPE}
			
			nmcli con delete ${vpn_name}
		fi
	done
}

# ---------------------------------------------------------
# Maps keeps 7 days
# ---------------------------------------------------------
find ${DATA_PATH}/maps -mmin +10080 -type f -delete

nmcli radio wifi on

total_vpn_active=`nmcli con show --active | grep -c ' vpn '`

if [ ${total_vpn_active} -eq 0 ]
then
	# Check NO any active VPN at Network Manager

	# Clear VPN
	bash ${CLEAN_SHELL}

	# insert to VPN, keep OVPN
	bash ${ADD_SHELL} ${INPUT_COUNTRY_CODE}

	check_VPN
else
	if [ "${INPUT_WIFI_MODE}" == "wifi" ]
	then
		nmcli radio wifi off
	fi
	
	bash "${SHELL_PATH}/stop-vpngate.sh"
fi
