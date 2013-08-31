/*jshint maxlen: 100*/
(function(document) {
  'use strict';

  console.log('Feedly open the entry in background tab keybind started.');

  function openInTheBackground(url, focus)
  {
    if (toType(url) !== 'string' ||
      toType(focus) !== 'boolean' && focus !== void 0) {
      throw new Error('Invalid type of arguments.');
    }
    focus = (focus === void 0) ? false : focus;

    if (focus) {
      window.open(url);
    } else {
      var a = document.createElement('a');
      a.href = url;

      var evt = document.createEvent("MouseEvents");
      evt.initMouseEvent(
        "click", true, false, window, 0, 0, 0, 0, 0,
        true, false, false, false, 0, null);
      a.dispatchEvent(evt);
    }
  }

  document.addEventListener('click', function(event) {
    if (event.button === 0) { // clicked left button of mouse.
      var element = event.target;
      if (element.tagName === 'A') {
        // stopped event bubbles.
        event.preventDefault();
        event.stopPropagation();

        chrome.storage.local.get(null, function(items) {
          var storageName = 'all_background_checkbox';
          var all_background = items[storageName] ||
                               default_values[storageName];
          openInTheBackground(element.href, !all_background);
        });
      }
    }
  }, false);

  document.addEventListener("keyup", function(event) {
    chrome.storage.local.get(null, function(items) {
      // Press key and Open the new tab in background.
      var storageName = 'open_key_text';
      var open_key = items[storageName] || default_values[storageName];
      open_key = JSON.parse(open_key);

      var pushKey = keyCheck(event);
      if (compareObject(pushKey, open_key)) {
        console.log('the entry to open background tab.');

        var entries = document.evaluate(
          '//*[contains(@class, "selectedEntry")]',
          event.target, null, 7, null);
        var entry = entries.snapshotItem(0);
        var entryId = entry.id;

        // do you showed mini preview?
        var index = entryId.lastIndexOf('_abstract');
        if (index !== -1) {
          // yes
          entryId = entryId.slice(0, index);
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
          openInTheBackground(url);
        }
      }
    });
  }, false);
})(document);
