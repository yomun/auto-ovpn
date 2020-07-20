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

INPUT_STR="${1}"

IP_RE='^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'

DEFAULT_IP="192.168.0.1"

IP_OUTPUT=""

if [ ${#INPUT_STR} -gt 0 ]
then
	# echo "+"
	IP_OUTPUT=`dig -4 TXT +short o-o.myaddr.l.google.com @ns1.google.com`
else
	# echo "-"
	IP_OUTPUT=`dig -4 +short myip.opendns.com @resolver1.opendns.com`
fi

IP=`echo ${IP_OUTPUT} | sed "s/\"//g"`

if [[ ${IP} =~ ${IP_RE} ]]
then
	echo "${IP}"
else
	# 1- 15
	RAN=`echo $((1 + RANDOM % 15))`
	case ${RAN} in
		1)  IP=`curl https://ifconfig.me`;;
		2)  IP=`curl http://ipinfo.io/ip`;;
		3)  IP=`curl https://api.ipify.org`;;
		4)  IP=`curl http://checkip.dyndns.com/                | grep -Eo "(IP Address: )[0-9.]*"         | sed "s/IP Address: //g"`;;
		5)  IP=`curl http://checkip.dyndns.org/                | grep -Eo "(IP Address: )[0-9.]*"         | sed "s/IP Address: //g"`;;
		6)  IP=`curl http:/checkip.dyn.com/                    | grep -Eo "(IP Address: )[0-9.]*"         | sed "s/IP Address: //g"`;;
		7)  IP=`curl http://ipecho.net/                        | grep -Eo "(Your IP is )[0-9.]*"          | sed "s/Your IP is //g"`;;
		8)  IP=`curl https://l2.io/ip.js?var=myip              | grep -Eo "[0-9.]*"`;;
		9)  IP=`curl http://www.showmemyip.com/                | grep -Eo "(Your IP address is: )[0-9.]*" | grep -Eo "[0-9.]*"`;;
		10)  IP=`curl https://api.userinfo.io/userinfos         | grep -Eo "(\"ip_address\":\")[0-9.]*"    | grep -Eo "[0-9.]*"`;;
		11) IP=`curl http://www.showip.com/                    | grep "Your IP address is "               | grep -Eo "[0-9.]*"`;;
		12) IP=`curl http://www.geoplugin.com/webservices/json | grep "\"geoplugin_request\":\""          | grep -Eo "[0-9.]*"`;;
		13) IP=`curl https://checkip.org                       | grep "Your IP Address:"                  | grep -Eo "[0-9]+\.[0-9]+\.[0-9]+\.[0-9
		14) IP=`curl https://checkip.hk                        | grep "Your IP Address:"                  | grep -Eo "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+"`;;
		 *) IP=`curl https://who.is                            | grep "Your IP address is"                | grep -Eo "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+" | head -1`;;
		
	esac

	if [[ ${IP} =~ ${IP_RE} ]]
	then
		echo "${IP}"
	else
		echo "${DEFAULT_IP}"
	fi
fi
