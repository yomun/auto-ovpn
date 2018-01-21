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

IP="${1}"

IP_RE='^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'

COUNTRY_CODE=""
COUNTRY_NAME=""
REGION=""
CITY=""
POSTAL=""
N=""
E=""
LOCATION=""
ORG=""

if [[ ${IP} =~ ${IP_RE} ]]
then

	output0=`geoiplookup ${IP}`

	# echo "${output0}"

	IFS=$'\n' read -rd '' -a array <<< "${output0}"

	# echo ${#array[@]}

	if [ ${#array[@]} -gt 0 ]
	then
		for element in "${array[@]}"
		do
			line="${element}"

			i=`echo ${line} | grep -c "GeoIP Country Edition: "`
			if [ "${i}" == "1" ]
			then
				i=`echo ${line} | sed 's/.*: //'`
				# echo "${i}"
				COUNTRY_CODE=`echo ${i} | sed 's/, .*//'`
				COUNTRY_NAME=`echo ${i} | sed 's/.*, //'`
				# echo "|${COUNTRY_CODE}|"
				# echo "|${COUNTRY_NAME}|"
			fi

			i=`echo ${line} | grep -c "GeoIP City Edition, Rev "`
			if [ "${i}" == "1" ]
			then
				i=`echo ${line} | sed 's/.*: //'`
				# echo "${i}"
				cnt=0
				IFS=',' read -ra '' -a array2 <<< "${i}"
				for element2 in "${array2[@]}"
				do
					line2=`echo ${element2} | sed -e 's/^[ \t]*//'`
					# echo "${cnt}|${line2}|"
					if [ $cnt -eq 2 ]; then REGION=`echo ${line2}`; fi
					if [ $cnt -eq 3 ]; then CITY=`echo ${line2}`; fi
					if [ $cnt -eq 4 ]; then POSTAL=`echo ${line2}`; fi
					if [ $cnt -eq 5 ]; then N=`echo ${line2}`; N=`printf "%0.4f\n" ${N}`; fi
					if [ $cnt -eq 6 ]; then E=`echo ${line2}`; E=`printf "%0.4f\n" ${E}`; fi
					if [ ${#N} -gt 0 ] && [ ${#E} -gt 0 ]; then LOCATION="${N},${E}"; fi
					
					((cnt++))
				done
			fi

			i=`echo ${line} | grep -c "GeoIP ASNum Edition: "`
			if [ "${i}" == "1" ]
			then
				i=`echo ${line} | sed 's/.*: //'`
				ORG=${i}
			fi
		done
	fi
fi

if [ ${#LOCATION} -gt 1 ]
then
	echo "{"
	echo "\"ip\": \"${IP}\","
	echo "\"hostname\": \"\","
	echo "\"city\": \"${CITY}\","
	echo "\"region\": \"${REGION}\"," # region_name
	echo "\"country\": \"${COUNTRY_CODE} / ${COUNTRY_NAME}\"," # country_name / code
	echo "\"loc\": \"${LOCATION}\"," # latitude, longitude
	echo "\"org\": \"${ORG}\","
	echo "\"postal\": \"${POSTAL}\"" # zip_code
	echo "}"
fi
