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
#-------------------------------
# Use for download ovpn files
#-------------------------------

FOLDER="ovpn"

FILE_TYPE=".ovpn"

FILE_PREFIX="vpngate_"

IP_RE='^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'

SHELL_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DATA_PATH=`echo "${SHELL_PATH}" | sed -e 's/\/sh$//'`

PFOLDER="${DATA_PATH}/${FOLDER}"

DATE=`date +%Y%m%d%H%M%S`

LINK="http://www.vpngate.net/api/iphone/"

IN=`curl ${LINK}`

while read line; do
	IFS=','
	read -a IN_arr <<< "${line}"
	if [[ ${IN_arr[1]} =~ ${IP_RE} ]]
	then
		# ignore stderr - base64: invalid input
		data_ori=`echo -n "${IN_arr[14]}" | base64 -d 2> /dev/null`

		# remove remarks
		data_rem=`echo ${data_ori} | grep -v ^# | grep -v ^$`

		data_pro=`echo ${data_rem} | grep proto  | tr " " ","`
		data_ipp=`echo ${data_rem} | grep remote | tr " " ","`

		# proto: TCP / UDP
		IFS=','
		read -a arr_m <<< "${data_pro}"
		proto=`echo ${arr_m[1]} | sed $'s/[\\r]//'`

		# IP / PORT
		IFS=','
		read -a arr_n <<< "${data_ipp}"
		ip=`echo ${arr_n[1]}`
		pt=`echo ${arr_n[2]} | sed $'s/[\\r]//'`

		COUNTRY_CODE=`geoiplookup "${ip}" | sed 's/^.*: //' | sed 's/,.*//' | head -n1`
		LEN_COUNTRY_CODE=`echo ${#COUNTRY_CODE}`

		PFilename=""

		if [ ${LEN_COUNTRY_CODE} -eq 2 ]
		then
			PFilename="${PFOLDER}/${FILE_PREFIX}${COUNTRY_CODE}_${ip}_${proto}_${pt}${FILE_TYPE}"
		else
			PFilename="${PFOLDER}/${FILE_PREFIX}${ip}_${proto}_${pt}${FILE_TYPE}"
		fi

		echo "${data_ori}" > "${PFilename}"
		
		### echo "${PFilename}" >> "${HOME}/Desktop/auto-ovpn-${DATE}.log"

		data_ori=""
	fi
done <<< "${IN}"

IN=""
