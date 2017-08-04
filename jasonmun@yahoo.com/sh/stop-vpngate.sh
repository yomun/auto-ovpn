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
#############################
# stop all of vpn
#############################

RUN_SUDO="yes" # yes/no

SHELL_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

START_SHELL="${SHELL_PATH}/start-vpngate.sh"

# kill all of Start Shell Process
function kill_START_SHELL_PROCESS()
{
	local ALL_PID=`ps -ef | grep "bash ${START_SHELL}" | awk '{print $2}' | tr "\n" " "`

	for pid in ${ALL_PID}
	do
		kill -9 ${pid}
	done
}

# stop all of VPN
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

if [ "${RUN_SUDO}" = "yes" ]
then
	sudo nmcli con reload
fi
