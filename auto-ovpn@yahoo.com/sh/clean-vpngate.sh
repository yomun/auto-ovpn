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
# Delete all of old files: /{FOLDER}/vpngate_{IP}_{PROTOCOL}_{PORT}.ovpn
#--------------------------------------------------------------------------------------

KEEP_MIN="120"
KEEP_FILES="200"
MIN_OVPN_FILES="10"

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

if [ -d "${PFOLDER}" ]
then
	echo ""
else
	mkdir -p "${PFOLDER}"
	echo "mkdir ${PFOLDER}"
fi

# -----------------------------------------------------------
# Decide whether download new OVPN
# -----------------------------------------------------------
OVPN_OUTDATED="no"

function get_NEW_OVPN_FROM_LOCAL()
{	
	local IS_DOWNLOAD="no"

	local total_ovpn=`ls ${POVPN_PATTERN} | wc -l`
	
	if [[ ${total_ovpn} =~ ${NUMBER_RE} ]]
	then
		echo "[C] Total of OVPN files: ${total_ovpn}"
	fi
	
	if [ ${total_ovpn} -le ${MIN_OVPN_FILES} ]
	then
		# If OVPN files <= ${MIN_OVPN_FILES}
		IS_DOWNLOAD="yes"
	else
		# If OVPN files is outdate
		OVPN_OUTDATED="no"

		is_OVPN_FILE_OUTDATED
		
		if [ "${OVPN_OUTDATED}" == "yes" ]
		then
			IS_DOWNLOAD="yes"
		fi
	fi

	if [ "${IS_DOWNLOAD}" == "yes" ]
	then
		download_NEW_OVPN
	fi
}

# -----------------------------------------------------------
# Check whether *.ovpn is outdate
# -----------------------------------------------------------
function is_OVPN_FILE_OUTDATED()
{
	OVPN_OUTDATED="no"

	local ALL_OVPN_LIST=`ls -t ${POVPN_PATTERN} | tail -1`
	
	for pOVPN in ${ALL_OVPN_LIST}
	do
		local filename=`find "${pOVPN}" -mmin +${KEEP_MIN}`
		if [ ${#filename} -gt 0 ]
		then
			OVPN_OUTDATED="yes"
		fi
	done
}

# -----------------------------------------------------------
# Download New OVPN
# -----------------------------------------------------------
function download_NEW_OVPN()
{
	# Backup Old OVPN files (*.ovpn >> *.vpn)
	if [ `ls ${PFOLDER}/*${FILE_TYPE} | wc -l` -gt 0 ]
	then
		rename -v "s/${FILE_TYPE}\$/${FILE_TYPE_REM}/" ${PFOLDER}/*${FILE_TYPE}
	fi

	DOWNLOAD_OVPN_TOTAL=""
	
	# BASH: Download New *.ovpn
	bash ${DOWNLOAD_SHELL}

	DOWNLOAD_OVPN_TOTAL=`ls ${POVPN_PATTERN} | wc -l`
	
	if [[ ${DOWNLOAD_OVPN_TOTAL} =~ ${NUMBER_RE} ]]
	then
		# Get new *.ovpn
		echo "Total of download OVPN files: ${DOWNLOAD_OVPN_TOTAL}"
	fi
	
	if [ "${DOWNLOAD_OVPN_TOTAL}" -gt "0" ]
	then
		# Downloand Successfully

		# BASH: Clear settings in Network Manager
		bash ${DELETE_SHELL}

		# Delete Old OVPN files (*.vpn)
		rm -rf ${PFOLDER}/${FILE_PREFIX}*${FILE_TYPE_REM}

		# Delete all OVPN keeps over ${KEEP_MIN}
		find ${PFOLDER} -mmin +${KEEP_MIN} -type f -delete
	
		# Keeps Maximum 200 OVPN files
		ls -tr ${PFOLDER} | head -n -${KEEP_FILES} | xargs -d '\n' rm -f --
	else
		# Download NOT Successfully

		# Use back Old OVPN files (*.vpn >> *.ovpn)
		rename -v "s/${FILE_TYPE_REM}\$/${FILE_TYPE}/" ${PFOLDER}/*${FILE_TYPE_REM}
	fi
}

get_NEW_OVPN_FROM_LOCAL
