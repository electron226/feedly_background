(function(window, document) {
  "use strict";

  var myOptions = null;

  function setSettingsToStorage(settings)//{{{
  {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(settings, function() {
        if (chrome.runtime.lastError) {
          error(chrome.runtime.lastError.message);
          reject();
          return;
        }
        resolve();
      });
    });
  }//}}}

  function getSettingsFromStorage()//{{{
  {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(null, function(items) {
        if (chrome.runtime.lastError) {
          error(chrome.runtime.lastError.message);
          reject();
          return;
        }
        resolve(items);
      });
    });
  }//}}}

  function showStatusMessage(targetId, message, showTime)//{{{
  {
    if (showTime === void 0 || showTime === null) {
      showTime = 1000;
    }

    return new Promise(resolve => {
      var t = document.getElementById(targetId);

      t.textContent = message;
      setTimeout(function() {
        t.textContent = '';
      }, showTime);

      resolve();
    });
  }//}}}

  function setDefaultOptions(config)//{{{
  {
    var values = {};
    for (var key in default_values) {
      if (default_values.hasOwnProperty(key)) {
        values[key] = (config.hasOwnProperty(key)) ?
                        config[key] : default_values[key];
      }
    }
    return values;
  }//}}}

  function loadOptions()//{{{
  {
    return new Promise(function(resolve, reject) {
      getSettingsFromStorage().then(initOptions).then(resolve, reject);
    });
  }//}}}

  function initOptions(options)//{{{
  {
    return new Promise((resolve, reject) => {
      myOptions = setDefaultOptions(options || default_values);
      setOptions(myOptions)
      .then(function() {
        return showStatusMessage('storageStatus', 'Initialized.');
      }).then(resolve, reject);
    }, 0);
  }//}}}

  function setKeyInfo(targetKey, keyObj, setOption)//{{{
  {
    var keyString = generateKeyString(keyObj);

    var el = document.evaluate(
      '//*[@id="' + targetKey + '"]', document, null, 7, null);
    var current = document.evaluate(
      'child::input[@class="current"]', el.snapshotItem(0), null, 7, null);
    var keyJSON = document.evaluate(
      'child::input[@class="keyJSON"]', el.snapshotItem(0), null, 7, null);
    current.snapshotItem(0).value = trim(keyString);
    var json = JSON.stringify(keyObj);
    keyJSON.snapshotItem(0).value = trim(json);
    if (setOption) {
      myOptions[targetKey] = json;
    }
  }//}}}

  var targetKey = null;
  document.addEventListener('keyup', function(e) {
    if (targetKey) {
      var keyValues = keyCheck(e);
      setKeyInfo(targetKey, keyValues, true);
      targetKey = null;
    }
  });

  function setButtonEvent()//{{{
  {
    function onClicked(e)//{{{
    {
      var config;

      switch (e.target.id) {
      case 'save':
        setSettingsToStorage(myOptions)
        .then(function() {
          return showStatusMessage('storageStatus', 'Saved.');
        });
        break;
      case 'load':
        loadOptions();
        break;
      case 'init':
        initOptions(default_values);
        break;
      case 'export':
        config = document.getElementById('config');
        config.value = JSON.stringify(myOptions, null, '   ');
        showStatusMessage('setValuesStatus', 'Exported.');
        break;
      case 'import':
        config = document.getElementById('config');
        myOptions = JSON.parse(trim(config.value));
        setOptions(myOptions)
        .then(function() {
          return showStatusMessage('setValuesStatus', 'Imported.');
        });
        break;
      }

      switch (e.target.className) {
      case 'setKey':
        targetKey = e.target.getAttribute('name');
        break;
      }
    }//}}}

    return new Promise((resolve, reject) => {
      var item;
      var els = document.evaluate('//button', document, null, 7, null);
      for (var i = 0, len = els.snapshotLength; i < len; i++) {
        item = els.snapshotItem(i);
        item.onclick = onClicked;
      }
    }, 0);
  }//}}}

  function setOptionElementsEvent()//{{{
  {
    function onChanged(e) {//{{{
      switch (e.target.type) {
      case 'number':
        myOptions[e.target.name] = parseInt(e.target.value, 10);
        break;
      case 'radio':
        myOptions[e.target.name] = e.target.value;
        break;
      case 'checkbox':
        myOptions[e.target.name] = e.target.checked;
        break;
      case 'text':
      case 'textarea':
        myOptions[e.target.name] = trim(e.target.value);
        break;
      }
    }//}}}

    return new Promise((resolve, reject) => {
      var item;
      var els = document.evaluate(
        '//input|//textarea', document, null, 7, null);
      for (var i = 0, len = els.snapshotLength; i < len; i++) {
        item = els.snapshotItem(i);
        item.onchange = onChanged;
      }
      resolve();
    }, 0);
  } //}}}

  function setOptions(settings)//{{{
  {
    return new Promise((resolve, reject) => {
      var item;
      var els = document.evaluate(
        '//input|//textarea', document, null, 7, null);
      for (var i = 0, len = els.snapshotLength; i < len; i++) {
        item = els.snapshotItem(i);
        if (!settings.hasOwnProperty(item.name)) {
          continue;
        }

        switch (item.type) {
        case 'text':
          // key info only.
          setKeyInfo(item.name, JSON.parse(settings[item.name]), false);
          break;
        case 'number':
          item.value = settings[item.name];
          break;
        case 'radio':
          if (item.value === settings[item.name]) {
            item.checked = true;
          }
          break;
        case 'checkbox':
          item.checked = settings[item.name];
          break;
        case 'textarea':
          item.value = settings[item.name];
          break;
        }
      }
      resolve();
    }, 0);
  }//}}}

  document.addEventListener('DOMContentLoaded', function() {//{{{
    getFile(translation_path)
    .then(function(response) {
      return setTranslations(document, JSON.parse(response));
    })
    .then(loadOptions)
    .then(setOptionElementsEvent)
    .then(setButtonEvent);
  });//}}}
})(window, document);
