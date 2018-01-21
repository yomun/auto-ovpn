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

DEFAULT_COUNTRY_CODE="MY"

IP="${1}"

if [ ${#IP} -gt 6 ]
then
	COUNTRY_CODE=`geoiplookup "${IP}" | sed 's/.*: //' | sed 's/,.*//' | head -n1`

	if [ ${#COUNTRY_CODE} -ge 2 ] && [ ${#COUNTRY_CODE} -le 3 ]
	then
		echo "${COUNTRY_CODE}"
	else
		echo "${DEFAULT_COUNTRY_CODE}"
	fi
else
	echo "${DEFAULT_COUNTRY_CODE}"
fi
