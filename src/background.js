(function() {
  'use strict';

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.event) {
      case "open":
        chrome.tabs.create(message.options, () => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            sendResponse(false);
            return;
          }
          sendResponse(true);
        });
        break;
    }
  });

  /**
   * 拡張機能がインストールされたときの処理
   */
  function onInstall() {
    debug('Extension Installed.');

    return new Promise(resolve => {
      // インストール時にオプションページを表示
      chrome.tabs.create({ url: optionPage }, resolve);
    });
  }

  /**
   * 拡張機能がアップデートされたときの処理
   */
  function onUpdate() {
    debug('Extension Updated.');

    return new Promise(function(resolve) {
      resolve();
    });
  }

  /**
   * 拡張機能のバージョンを返す
   * @return {String} 拡張機能のバージョン.
   */
  function getVersion() {
    debug('getVersion');
    var details = chrome.app.getDetails();
    return details.version;
  }

  function versionCheckAndUpdate()
  {
    debug('versionCheckUpdate');

    return new Promise((resolve, reject) => {
      var currVersion = getVersion();

      chrome.storage.local.get(versionKey, function(storages) {
        function update()
        {
          return new Promise(function(resolve) {
            var write = {};
            write[versionKey] = currVersion;
            chrome.storage.local.set(write, resolve);
          });
        }

        if (chrome.runtime.lastError) {
          error(chrome.runtime.lastError.message);
          reject();
          return;
        }

        // ver chrome.storage.
        var prevVersion = storages[versionKey];
        if (currVersion !== prevVersion) {
          // この拡張機能でインストールしたかどうか
          if (prevVersion === void 0) {
            onInstall().then(update).then(resolve, reject);
          } else {
            onUpdate().then(update).then(resolve, reject);
          }
        } else {
          resolve();
        }
      });
    });
  }

  function deleteInvalidOptions()
  {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(null, function(items) {
        // All remove invalid options.
        var removeKeys = [];
        for (var key in items) {
          if (!default_values.hasOwnProperty(key)) {
            removeKeys.push(key);
          }
        }
        chrome.storage.local.remove(removeKeys, function() {
          if (chrome.runtime.lastError) {
            error(chrome.runtime.lastError.message);
            reject();
            return;
          }
          resolve();
        });
      });
    });
  }

  function initialize()
  {
    versionCheckAndUpdate()
    .then(deleteInvalidOptions);
  }

  initialize();
})();
