#!/usr/bin/env bash

SHELL_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)"

DEL_SHELL="${SHELL_PATH}/del-vpngate.sh"
ACTIVE_VPN_TOTAL_SHELL="${SHELL_PATH}/active-vpn-total.sh"
START_SHELL="${SHELL_PATH}/start-vpngate.sh"
EDIT_SHELL="${SHELL_PATH}/edit-vpngate.sh"
STOP_SHELL="${SHELL_PATH}/stop-vpngate.sh"

# echo "192.168.0.1 | iconName=starred"
# echo "---"

# echo "Wikipedia | image='$WIKIPEDIA_ICON' imageWidth=20 font=serif href='https://en.wikipedia.org'"
# echo "---"
# echo "Gedit | iconName=gedit bash=gedit terminal=false"
# echo "Nautilus | iconName=system-file-manager bash=nautilus terminal=false"
# echo "Process list (<span color='yellow'><tt>top</tt></span>) | iconName=utilities-terminal-symbolic bash=top"
# echo "---"
# echo "Looking Glass | eval='imports.ui.main.createLookingGlass(); imports.ui.main.lookingGlass.toggle();'"

echo "Delete all of VPN | iconName=edit-clear bash=${DEL_SHELL} terminal=false"
echo "Start VPN | iconName=media-playback-start bash=${START_SHELL} terminal=false"
echo "Change VPN | iconName=media-skip-forward bash=${EDIT_SHELL} terminal=false"
echo "Stop VPN | iconName=media-playback-stop bash=${STOP_SHELL} terminal=false"