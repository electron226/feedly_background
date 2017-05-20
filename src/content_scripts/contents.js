/*jshint maxlen: 100*/
(function(document) {
  'use strict';

  console.log('Feedly open the entry in background tab keybind started.');

  let myOptions = null;
  chrome.storage.local.get(null, function(items) {
    myOptions = items;
    for (let key in default_values) {
      if (!myOptions.hasOwnProperty(key)) {
        myOptions[key] = default_values[key];
      }
    }
  });

  function openInTheBackground(url, focus)
  {
    console.assert(toType(url) === "string", "not string.");

    let active = (toType(focus) === "boolean") ? focus : false;
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
          event: "open",
          options: { url: url, active: active }
      }, response => {
        if (response) {
          resolve();
        } else {
          reject("doesn't create tab.");
        }
      });
    });
  }

  document.addEventListener('click', function(event) {
    if (event.button === 0) { // clicked left button of mouse.
      let element = event.target;
      if (element.tagName === 'A') {
        // stopped event bubbles.
        event.preventDefault();
        event.stopPropagation();

        openInTheBackground(element.href, !myOptions.all_background);
      }
    }
  }, false);

  document.addEventListener("keyup", function(event) {
    let pushKey = keyCheck(event);

    // Open the new tab in background.
    if (deepCompare(pushKey, JSON.parse(myOptions.open_key))) {
      console.log('the entry to open background tab.');

      let entry = document.querySelector(".list-entries .entry.selected");
      let url   = entry.getAttribute("data-alternate-link");

      if (url) {
        openInTheBackground(url);
      }
    }

    // If the entry is opened, open the new tab in background.

    // unread entries open at a time.
    if (deepCompare(pushKey, JSON.parse(myOptions.allopen_key))) {
      let i, item;

      let entries = document.querySelectorAll(".list-entries .entry.unread");
      for (i = 0; i < parseInt(myOptions.open_number, 10) &&
        i < entries.length; i++) {
        item = entries[i];
        openInTheBackground(item.getAttribute("data-alternate-link"));
        item.className = item.className.replace("unread", "read");
      }
    }
  }, false);
})(document);
