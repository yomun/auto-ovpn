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
#--------------------------------------------------------------------------------------
# add {FOLDER}/vpngate_{COUNTRY-CODE}_{IP}_{PROTOCOL}_{PORT}.ovpn to Network Manager
#--------------------------------------------------------------------------------------

NUMBER_RE='^[0-9]+$'

FOLDER="ovpn"

FILE_TYPE=".ovpn"

FILE_PREFIX="vpngate_"

MAX_VPN=10

SHELL_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DATA_PATH=`echo "${SHELL_PATH}" | sed -e 's/\/sh$//'`

PFOLDER="${DATA_PATH}/${FOLDER}"

POVPN_PATTERN="${PFOLDER}/${FILE_PREFIX}*${FILE_TYPE}"

COUNTRY_CODE=""

if [ ${#1} -eq 2 ] || [ ${#2} -eq 2 ]
then
	if [ ${#1} -eq 2 ]
	then
		COUNTRY_CODE="${1}"
	elif [ ${#2} -eq 2 ]
	then
		COUNTRY_CODE="${2}"
	else
		COUNTRY_CODE=""
	fi
fi

#---------------------------------------
# Import OVPN to Network Manager
#---------------------------------------
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

#---------------------------------------------------------------------
# check Network Manager how many VPN needs to add ( ${MAX_VPN} )
#---------------------------------------------------------------------
function check_OVPN()
{
	local total=`ls ${POVPN_PATTERN} | wc -l`
	
	if [[ ${total} =~ ${NUMBER_RE} ]]
	then
		echo "[A] Total of OVPN files: ${total}"
	fi
	
	if  [ ${total} -gt 0 ]
	then		
		# ls -itr
		OVPN_LIST=`ls -tr ${POVPN_PATTERN} | tr "\n" " "`
		
		if [ ${#COUNTRY_CODE} -eq 2 ]
		then
			local PATTERN_COUNTRY_CODE="${PFOLDER}/${FILE_PREFIX}${COUNTRY_CODE}_*${FILE_TYPE}"
			
			local LIST_COUNTRY_CODE=`ls -tr ${PATTERN_COUNTRY_CODE} | tr "\n" " "`
			
			if [ `echo ${#LIST_COUNTRY_CODE} | bc` -gt 10 ]
			then
				OVPN_LIST=`echo ${OVPN_LIST} | sed -e 's/${PATTERN_COUNTRY_CODE} //'`
				
				OVPN_LIST=`echo "${LIST_COUNTRY_CODE} ${OVPN_LIST}" | tr "\n" " "`
			fi	
		fi

		import_OVPN
	fi
}

VPNGATE_TOTAL=`nmcli con show | grep " vpn " | grep -c "^vpngate_"`

ADD_TOTAL=`echo "${MAX_VPN}-${VPNGATE_TOTAL}" | bc`

if [ ${ADD_TOTAL} -gt 0 ]
then
	check_OVPN
fi
