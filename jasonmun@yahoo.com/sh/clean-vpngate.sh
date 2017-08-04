#!/bin/bash
#
# Auto OVPN gnome extension
# https://jasonmun.blogspot.my
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
# along with Show Ip gnome extension.  If not, see <http://www.gnu.org/licenses/>.
# 
###################################################################################
# Delete all of old files: /{FOLDER}/vpngate_{IP}_{PROTOCOL}_{PORT}.ovpn
##################################################################################

NUMBER_RE='^[0-9]+$'

FOLDER="ovpn"

FILE_TYPE=".ovpn"

FILE_TYPE_REM=".vpn"

FILE_PREFIX="vpngate_"

SHELL_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DATA_PATH=`echo "${SHELL_PATH}" | sed -e 's/\/sh$//'`

PFOLDER="${DATA_PATH}/${FOLDER}"

POVPN_PATTERN="${PFOLDER}/${FILE_PREFIX}*${FILE_TYPE}"

DOWNLOAD_SHELL="${SHELL_PATH}/down-vpngate.sh"

DELETE_SHELL="${SHELL_PATH}/del-vpngate.sh"

mkdir "${PFOLDER}"

# decide whether download new OVPN
function get_NEW_OVPN_FROM_LOCAL()
{	
	local total=`ls ${POVPN_PATTERN} | wc -l`
	
	if [[ ${total} =~ ${NUMBER_RE} ]]; then echo "[OVPN] ${total}"; fi
	
	if [ ${total} -le 10 ]
	then
		download_NEW_OVPN
	else
		is_OVPN_FILE_OUTDATED
		
		if [ "${OVPN_OUTDATED}" = "yes" ]
		then
			download_NEW_OVPN
		fi
	fi
}

# download new OVPN from VPNGate.jar
function download_NEW_OVPN()
{
	bash ${DELETE_SHELL}

	DOWNLOAD_OVPN_TOTAL=""
	
	bash ${DOWNLOAD_SHELL}
	
	DOWNLOAD_OVPN_TOTAL=`ls ${POVPN_PATTERN} | wc -l`
	
	if [[ ${DOWNLOAD_OVPN_TOTAL} =~ ${NUMBER_RE} ]]
	then
		echo "[DOWN] ${DOWNLOAD_OVPN_TOTAL}"
	fi
	
	if [ "${DOWNLOAD_OVPN_TOTAL}" -gt "0" ]
	then
		# Success (delete .vpn, keep .ovpn)
		rm -rf ${PFOLDER}/${FILE_PREFIX}*${FILE_TYPE_REM}
		sleep 2
		del_OLD_VPN_NM
	else
		# Not Success (.vpn -> .ovpn)
		rename -v "s/${FILE_TYPE_REM}\$/${FILE_TYPE}/" ${PFOLDER}/*${FILE_TYPE_REM}
	fi
}

# delete old VPN
function del_OLD_VPN_NM()
{		
	local VPNGATE_LIST=`nmcli con show | grep ' vpn ' | grep '^vpngate_' | awk '{print $1}' | tr "\n" " "`
		
	for vpn_name in ${VPNGATE_LIST}
	do
		nmcli con down ${vpn_name}
		nmcli con delete ${vpn_name}
	done
}

# if latest OVPN is outdated, then set OVPN_OUTDATED="yes"
function is_OVPN_FILE_OUTDATED()
{
	OVPN_OUTDATED="no"

	local ALL_OVPN_LIST=`ls -t ${POVPN_PATTERN} | tail -1`
	
	for pOVPN in ${ALL_OVPN_LIST}
	do
		local str=`find "${pOVPN}" -mmin +120`
		if [ ${#str} -gt 0 ]
		then
			OVPN_OUTDATED="yes"
		fi
	done
}

get_NEW_OVPN_FROM_LOCAL
