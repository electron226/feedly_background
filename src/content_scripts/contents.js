/*jshint maxlen: 100*/
(function(document) {
  'use strict';

  console.log('Feedly open the entry in background tab keybind started.');

  var myOptions = null;
  chrome.storage.local.get(null, function(items) {
    myOptions = items;
    for (var key in default_values) {
      if (!myOptions.hasOwnProperty(key)) {
        myOptions[key] = default_values[key];
      }
    }
  });

  function openInTheBackground(url, focus)
  {
    if (toType(url) !== 'string' ||
      toType(focus) !== 'boolean' && focus !== void 0) {
      throw new Error('Invalid type of arguments.');
    }
    focus = (focus === void 0) ? false : focus;

    var message = {};
    message.event = 'open';
    message.url = url;
    message.active = focus;
    chrome.runtime.sendMessage(message, function(response) {
      console.assert(
        response !== true, "Extension open the tab at a entry. failed.");
    });
  }

  document.addEventListener('click', function(event) {
    if (event.button === 0) { // clicked left button of mouse.
      var element = event.target;
      if (element.tagName === 'A') {
        // stopped event bubbles.
        event.preventDefault();
        event.stopPropagation();

        openInTheBackground(element.href, !myOptions.all_background);
      }
    }
  }, false);

  document.addEventListener("keyup", function(event) {
    var entries;
    var pushKey = keyCheck(event);

    // Open the new tab in background.
    if (compareObject(pushKey, JSON.parse(myOptions.open_key))) {
      console.log('the entry to open background tab.');

      entries = document.evaluate(
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

    // unread entries open at a time.
    if (compareObject(pushKey, JSON.parse(myOptions.allopen_key))) {
      var i, item;
      entries = document.evaluate(
        '//div[@id="feedlyPart"]' +
        '//a[contains(@class, "title") and contains(@class, "unread")]',
        document, null, 7, null);
      for (i = 0; i < parseInt(myOptions.open_number, 10) &&
        i < entries.snapshotLength; i++) {
        item = entries.snapshotItem(i);
        openInTheBackground(item.href);
        item.className = item.className.replace("unread", "read");
      }
    }
  }, false);
})(document);
