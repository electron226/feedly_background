console.log('Feedly open the entry in background tab keybind started.');

document.addEventListener("keyup", function(event) {
  'use strict';

  // Press key and Open a new tab in background.
  chrome.storage.local.get(null, function(items) {
    var storageName = 'open_key_text';
    var open_key = items[storageName] || default_values[storageName];
    open_key = JSON.parse(open_key);

    var pushKey = keyCheck(event);
    if (compareObject(pushKey, open_key)) {
      console.log('the entry to open background tab.');

      var entries = document.evaluate(
          '//*[contains(@class, "selectedEntry")]',
          document, null, 7, null);
      var entry = entries.snapshotItem(0);
      var entryId = entry.id;

      // do you showed mini preview?
      var i = entryId.lastIndexOf('_abstract');
      if (i !== -1) {
        // yes
        entryId = entryId.slice(0, i);
      }

      // Find url of select articles.
      var urls = document.evaluate(
          '//a[contains(@id, "' + entryId + '_title")]',
          entry, null, 7, null);
      if (urls.snapshotLength !== 1) {
          return;
      }

      var url = urls.snapshotItem(0).href;

      if (url) {
          // This extension will open url.
          var a = document.createElement('a');
          a.href = url;

          var evt = document.createEvent("MouseEvents");
          evt.initMouseEvent(
            "click", true, true, window, 0, 0, 0, 0, 0,
            true, false, false, false, 0, null);
          a.dispatchEvent(evt);
      }
    }
  });
}, true);
