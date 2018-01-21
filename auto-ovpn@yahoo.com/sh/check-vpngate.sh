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

SHELL_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

ACTIVE_VPN_LIST=`nmcli con show --active | grep ' vpn ' | awk '{print $1}' | tr "\n" " "`

START_SHELL_RUN=`ps aux | grep -c "bash ${SHELL_PATH}/start-vpngate.sh"`

if [ ${#ACTIVE_VPN_LIST} -eq 0 ]
then
	if [ "${START_SHELL_RUN}" == "0" ] || [ "${START_SHELL_RUN}" == "1" ]
	then
		# Network Manager Active VPN: X, start-vpngate.sh: X
		echo "0"
	else
		# Network Manager Active VPN: X, start-vpngate.sh: V
		echo "2"
	fi
else
	if [ "${START_SHELL_RUN}" == "0" ]
	then
		# Network Manager Active VPN: V, start-vpngate.sh: X
		echo "3"
	else
		# Network Manager Active VPN: V, start-vpngate.sh: V
		echo "4"
	fi
fi
