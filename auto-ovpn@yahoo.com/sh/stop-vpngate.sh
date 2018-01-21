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

START_SHELL="${SHELL_PATH}/start-vpngate.sh"
# START_SHELL="start-vpngate.sh"

# ------------------------------------
# Kill all of Start Shell Process
# ------------------------------------
function kill_START_SHELL_PROCESS()
{
	local ALL_PID=`ps -ef | grep "bash ${START_SHELL}" | awk '{print $2}' | tr "\n" " "`

	for pid in ${ALL_PID}
	do
		kill -9 ${pid}
	done
}

# ------------------------------------
# Stop all of VPN
# ------------------------------------
function stop_ALL_ACTIVE_VPN()
{
	local ACTIVE_VPN_LIST=`nmcli con show --active | grep ' vpn ' | awk '{print $1}' | tr "\n" " "`

	for vpn_name in ${ACTIVE_VPN_LIST}
	do
		nmcli con down $vpn_name
	done
}

kill_START_SHELL_PROCESS

stop_ALL_ACTIVE_VPN

# sudo nmcli con reload
