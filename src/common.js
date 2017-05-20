/*jshint maxlen: 100, unused: false*/
(function(window) {
  "use strict";

  var defaultValues = {
    'open_key': JSON.stringify(
      { ctrl: false, alt: false, shift: false, meta: false, keyCode: 73 }),
    'allopen_key': JSON.stringify(
      { ctrl: true, alt: false, shift: false, meta: false, keyCode: 73 }),
    'open_number': 10,
    'all_background': false
  };
  window.versionKey                = window.versionKey || 'version';
  defaultValues[window.versionKey] = '1.0.0';
  window.default_values            = window.default_values || defaultValues;

  window.optionPage = window.optionPage ||
                      chrome.runtime.getURL('options.html');

  window.translation_path = window.translation_path ||
                         chrome.runtime.getURL('_locales/ja/messages.json') ||
                         chrome.runtime.getURL('_locales/en/messages.json');
})(window);
