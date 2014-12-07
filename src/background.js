(function() {
  'use strict';

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    debug('runtime.onMessage', message);
    switch (message.event) {
    case 'open':
      chrome.tabs.create(
        { url: message.url, active: message.active }, function() {
          sendResponse(true);
        }
      );
      break;
    case 'update_feedly_tab':
      chrome.tabs.query({ url: '*://feedly.com/*'}, function(results) {
        for (var i in results) {
          chrome.tabs.reload(results[i].id);
        }
      });
      break;
    }
    sendResponse(false);
  });

  /**
   * 拡張機能がインストールされたときの処理
   */
  function onInstall() {
    debug('Extension Installed.');

    return new Promise(function(resolve) {
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

    var deferred = Promise.defer();
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
        deferred.reject();
        return;
      }

      // ver chrome.storage.
      var prevVersion = storages[versionKey];
      if (currVersion !== prevVersion) {
        // この拡張機能でインストールしたかどうか
        if (prevVersion === void 0) {
          onInstall().then(update).then(deferred.resolve, deferred.reject);
        } else {
          onUpdate().then(update).then(deferred.resolve, deferred.reject);
        }
      } else {
        deferred.resolve();
      }
    });
    return deferred.promise;
  }

  function deleteInvalidOptions()
  {
    var deferred = Promise.defer();
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
          deferred.reject();
          return;
        }
        deferred.resolve();
      });
    });
    return deferred.promise;
  }

  function initialize()
  {
    versionCheckAndUpdate()
    .then(deleteInvalidOptions);
  }

  initialize();
})();
