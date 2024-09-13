// Initial entry point for the extension's service worker, the background
// context used by Chrome Manifest V3 extensions. This file is responsible for
// loading the extension's background scripts in Chrome. For the Firefox and
// Safari equivalent, see `bg.html`.

// When modifying the list of scripts loaded in the background context, make
// sure you update both this file and `bg.html`.
importScripts("lib/bg-log-wrapper.js", "background.js");
