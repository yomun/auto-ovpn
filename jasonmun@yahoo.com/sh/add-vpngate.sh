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
############################################################################
# add {FOLDER}/vpngate_{IP}_{PROTOCOL}_{PORT}.ovpn to Network Manager
############################################################################

NUMBER_RE='^[0-9]+$'

FOLDER="ovpn"

FILE_TYPE=".ovpn"

FILE_PREFIX="vpngate_"

MAX_VPN=10

SHELL_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DATA_PATH=`echo "${SHELL_PATH}" | sed -e 's/\/sh$//'`

PFOLDER="${DATA_PATH}/${FOLDER}"

POVPN_PATTERN="${PFOLDER}/${FILE_PREFIX}*${FILE_TYPE}"

# import OVPN to Network Manager
function import_OVPN()
{
	local total=${ADD_TOTAL}

	local cnt=0
	
	local VPNGATE_LIST=`nmcli con show | grep ' vpn ' | grep '^vpngate_' | awk '{print $1}'`
	
	local LIST=${OVPN_LIST}

	for pOVPN in ${LIST}
	do
		local fOVPN=`basename ${pOVPN}`

		if [ `echo ${VPNGATE_LIST} | grep -c ${fOVPN}` -eq 0 ]
		then
			### echo "[ADD VPN] ${pOVPN}"
			nmcli connection import type openvpn file ${pOVPN}

			cnt=`echo "${cnt}+1" | bc`
			
			if [ ${cnt} -eq ${total} ]; then break; fi
		fi
	done
}

# check Network Manager how many VPN needs to add ( ${MAX_VPN} )
function check_OVPN()
{
	local total=`ls ${POVPN_PATTERN} | wc -l`
	
	if [[ ${total} =~ ${NUMBER_RE} ]]
	then
		echo "[OVPN] ${total}"
	fi
	
	if  [ ${total} -gt 0 ]
	then
		# ls -itr
		OVPN_LIST=`ls -tr ${POVPN_PATTERN} | tr "\n" " "`

		import_OVPN
	fi
}

VPNGATE_TOTAL=`nmcli con show | grep " vpn " | grep -c "^vpngate_"`

ADD_TOTAL=`echo "${MAX_VPN}-${VPNGATE_TOTAL}" | bc`

if [ ${ADD_TOTAL} -gt 0 ]
then
	check_OVPN
fi
