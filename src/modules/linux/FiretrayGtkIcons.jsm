/* -*- Mode: js2; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

var EXPORTED_SYMBOLS = [ "firetray" ];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://firetray/ctypes/linux/gtk.jsm");
Cu.import("resource://firetray/commons.js");
firetray.Handler.subscribeLibsForClosing([gtk]);

if ("undefined" == typeof(firetray.StatusIcon))
  log.error("This module MUST be imported from/after StatusIcon !");

let log = firetray.Logging.getLogger("firetray.GtkIcons");


firetray.GtkIcons = {
  initialized: false,

  GTK_THEME_ICON_PATH: null,

  init: function() {
    try {
      if (this.initialized) return true;

      this.loadDefaultTheme();
      this.initialized = true;
      return true;
    } catch (x) {
      log.error(x);
      return false;
    }
  },

  shutdown: function() {
    this.initialized = false;
  },

  loadDefaultTheme: function() {
    this.GTK_THEME_ICON_PATH = firetray.Utils.chromeToPath("chrome://firetray/skin/icons/linux");
    log.debug(this.GTK_THEME_ICON_PATH);
    let gtkIconTheme = gtk.gtk_icon_theme_get_default();
    log.debug("gtkIconTheme="+gtkIconTheme);
    gtk.gtk_icon_theme_append_search_path(gtkIconTheme, this.GTK_THEME_ICON_PATH);

    if (log.level <= firetray.Logging.LogMod.Level.Debug) {
      Cu.import("resource://firetray/ctypes/linux/glib.jsm");
      Cu.import("resource://firetray/ctypes/linux/gobject.jsm");
      firetray.Handler.subscribeLibsForClosing([glib, gobject]);
      let path = new gobject.gchar.ptr.ptr;
      let n_elements = new gobject.gint;
      gtk.gtk_icon_theme_get_search_path(gtkIconTheme, path.address(), n_elements.address());
      log.debug("n_elements="+n_elements+" path="+path);
      let pathIt = path;
      for (let i=0, len=n_elements.value; i<len || pathIt.isNull(); ++i) {
        log.debug("path["+i+"]="+pathIt.contents.readString());
        pathIt = pathIt.increment();
      }
      log.debug("path="+path+" pathIt="+pathIt);
      glib.g_strfreev(path);
    }
  }

};
