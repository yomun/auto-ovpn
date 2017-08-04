#!/usr/bin/env python3

import gi, os, os.path, signal, _thread, threading, time, webbrowser

gi.require_version('Gtk', '3.0')
from gi.repository import Gtk
gi.require_version('AppIndicator3', '0.1')
from gi.repository import AppIndicator3 as AppIndicator
gi.require_version('Notify', '0.7')
from gi.repository import Notify as notify

from gi.repository import GObject

from subprocess import Popen, PIPE
from threading import Thread

APPINDICATOR_ID = "auto-ovpn"

APPINDICATOR_NAME = "Auto OVPN"

path = os.path.expanduser('~')

class Indicator():
    def __init__(self):
        self.app = APPINDICATOR_ID
        iconpath = "/opt/auto-ovpn/jasonmun@yahoo.com/icon.png"
        # os.path.abspath('/opt/auto-ovpn/icon.svg', AppIndicator.IndicatorCategory.SYSTEM_SERVICES)
        self.indicator = AppIndicator.Indicator.new(self.app, iconpath, AppIndicator.IndicatorCategory.OTHER)
        self.indicator.set_status(AppIndicator.IndicatorStatus.ACTIVE)
        self.indicator.set_menu(self.create_menu())
        self.indicator.set_label("Auto OVPN", self.app)
        #self.update = Thread(target=self.show_seconds)
        #self.update.setDaemon(True)
        #self.update.start()
        notify.init(APPINDICATOR_ID)

    def create_menu(self):
        menu = Gtk.Menu()
        item_del = Gtk.MenuItem('Delete all of VPN'); item_del.connect('activate', self.clicked_del); menu.append(item_del)
        seperator = Gtk.SeparatorMenuItem(); menu.append(seperator)
        item_start = Gtk.MenuItem('Start VPN'); item_start.connect('activate', self.clicked_start); menu.append(item_start)
        item_change = Gtk.MenuItem('Change VPN'); item_change.connect('activate', self.clicked_edit); menu.append(item_change)
        item_stop = Gtk.MenuItem('Stop VPN'); item_stop.connect('activate', self.clicked_stop); menu.append(item_stop)
        seperator = Gtk.SeparatorMenuItem(); menu.append(seperator)
        item_quit = Gtk.MenuItem('Quit'); item_quit.connect('activate', self.quit); menu.append(item_quit)
        menu.show_all()
        return menu

    def show_seconds(self):
        t = 2
        while True:
            time.sleep(1)
            mention = str(t)+" Monkeys"
            # apply the interface update using  GObject.idle_add()
            GObject.idle_add(self.indicator.set_label, mention, self.app, priority=GObject.PRIORITY_DEFAULT)
            t += 1

    def quit(self, source):
        notify.uninit()
        Gtk.main_quit()

    def clicked_del(self, source):
        thread_Del = myThread(4, "Thread-Del", "bash /opt/auto-ovpn/jasonmun@yahoo.com/sh/del-vpngate.sh");
        thread_Del.start();
        thread_Del.join()

    def clicked_start(self, source):
        try:
            _thread.start_new_thread(run_command, (1, "Thread-Start", "bash \"/opt/auto-ovpn/jasonmun@yahoo.com/sh/start-vpngate.sh\""))
        except:
            print("Error")

    def clicked_edit(self, source):
        thread_edit = myThread(2, "Thread-Edit", "bash /opt/auto-ovpn/jasonmun@yahoo.com/sh/edit-vpngate.sh");
        thread_edit.start();
        thread_edit.join()

    def clicked_stop(self, source):
        thread_Stop = myThread(3, "Thread-Stop", "bash /opt/auto-ovpn/jasonmun@yahoo.com/sh/stop-vpngate.sh");
        thread_Stop.start();
        thread_Stop.join()

class myThread (threading.Thread):
    def __init__(self, threadID, name, cmd):
        threading.Thread.__init__(self)
        self.threadID = threadID
        self.name = name
        self.cmd = cmd
    def run(self):
        run_command(self.threadID, self.name, self.cmd)

def run_command(id, threadName, cmd):
    p = Popen(cmd, shell=True, stdout=PIPE)
    out, err = p.communicate()
    if id == 4 :
        notify.Notification.new(APPINDICATOR_NAME, "Delete OVPN Completely.", None).show()

def console(cmd):
    p = Popen(cmd, shell=True, stdout=PIPE)
    out, err = p.communicate()
    return (p.returncode, out, err)

def func_open(source):
    path_filename = path + "/VPNGate.htm"
    my_file = os.path.isfile(path_filename)
    if my_file:
        webbrowser.open_new(path_filename)

Indicator()
GObject.threads_init()
signal.signal(signal.SIGINT, signal.SIG_DFL)
Gtk.main()
