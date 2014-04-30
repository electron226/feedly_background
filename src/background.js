/*jshint globalstrict: true*/
'use strict';

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  switch (message.event) {
    case 'open': {
        chrome.tabs.create(
          { url: message.url, active: message.active }, function() {
            sendResponse(true);
          }
        );
        break;
    }
  }
  sendResponse(false);
});

var versionKey = 'version';

/**
* この拡張機能外のスクリプトを使って行う初期化処理
*/
function init()
{
  chrome.storage.local.get(null, function(items) {
    // All remove invalid options.
    var removeKeys = [];
    for (var key in items) {
      if (!default_values.hasOwnProperty(key) && key !== versionKey) {
        removeKeys.push(key);
      }
    }
    chrome.storage.local.remove(removeKeys, function() {
    });
  });
}


/**
 * 拡張機能がインストールされたときの処理
 */
function onInstall() {
  console.log('Extension Installed.');

  // インストール時にオプションページを表示
  chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
}


/**
 * 拡張機能がアップデートされたときの処理
 */
function onUpdate() {
  console.log('Extension Updated.');
}


/**
 * 拡張機能のバージョンを返す
 * @return {String} 拡張機能のバージョン.
 */
function getVersion() {
  var details = chrome.app.getDetails();
  return details.version;
}

document.addEventListener('DOMContentLoaded', function() {
  // この拡張機能外のスクリプトを使って行う初期化処理
  init();

  // この拡張機能のバージョンチェック
  var currVersion = getVersion();
  chrome.storage.local.get(versionKey, function(storages) {
    // ver chrome.storage.
    var prevVersion = storages[versionKey];
    if (currVersion !== prevVersion) {
      // この拡張機能でインストールしたかどうか
      if (prevVersion === void 0) {
        onInstall();
      } else {
        onUpdate();
      }

      var write = {};
      write[versionKey] = currVersion;
      chrome.storage.local.set(write);
    }
  });
});
