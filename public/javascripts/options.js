/*jshint globalstrict: true*/
'use strict';

function loadValues(document, values, debugCallback)
{
  if (document === void 0 ||
      toType(values) !== 'object' && values !== null || values === void 0) {
    throw new Error('Arguments type error.');
  }

  // Get All Option Value.
  chrome.storage.local.get(null, function(items) {
    var debugList = []; // use Debug

    items = values || items;
    var element = null;
    for (var key in items) {
      var value = items[key];
      var elName = key.match(
          /(^[\w]*)_(text|password|radio|checkbox|number|textarea)$/);
      if (elName) {
        switch (elName[2]) {
          case 'number':
            element = document.evaluate(
                '//input[@name="' + elName[1] + '"]',
                document, null, 7, null);
            if (element.snapshotLength !== 1) {
              console.log('loadValues() Get ' + elName[1] + ' error.');
              continue;
            }
            element.snapshotItem(0).value = value;
            debugList.push(elName[1]);
            break;
          case 'radio':
            element = document.evaluate(
                '//input[@name="' + elName[1] + '"][@value="' + value + '"]',
                document, null, 7, null);
            if (element.snapshotLength !== 1) {
              console.log('loadValues() Get ' + elName[1] + ' error.');
              continue;
            }
            element.snapshotItem(0).checked = true;
            debugList.push(elName[1]);
            break;
          case 'checkbox':
            element = document.evaluate(
                '//input[@name="' + elName[1] + '"]', document, null, 7, null);
            if (element.snapshotLength !== 1) {
              console.log('loadValues() Get ' + elName[1] + ' error.');
              continue;
            }
            element.snapshotItem(0).checked = value;
            debugList.push(elName[1]);
            break;
          case 'password':
          case 'text':
            element = document.evaluate(
                '//input[@name="' + elName[1] + '"]', document, null, 7, null);
            if (element.snapshotLength !== 1) {
              console.log('loadValues() Get ' + elName[1] + ' error.');
              continue;
            }
            element.snapshotItem(0).value = trim(value);
            debugList.push(elName[1]);
            break;
          case 'textarea':
            element = document.evaluate(
                '//textarea[@name="' + elName[1] + '"]',
                document, null, 7, null);
            if (element.snapshotLength !== 1) {
              console.log('loadValues() Get ' + elName[1] + ' error.');
              continue;
            }
            element.snapshotItem(0).value = trim(value);
            debugList.push(elName[1]);
            break;
        }
      }
    }

    if (toType(debugCallback) === 'function') {
      debugCallback(debugList);
    }
  });
}

function saveValues(document, saveTypes, callback)
{
  if (document === void 0 || toType(saveTypes) !== 'array') {
    throw new Error('Invalid argument.');
  }
  var i, item;

  // inputタグの保存するtype
  var types = '';
  for (i = 0; i < saveTypes.length; i++) {
    types += '@type="' + saveTypes[i] + '"';
    if (i + 1 < saveTypes.length) {
      types += ' or ';
    }
  }

  var storageName;
  var writeData = {};
  var inputs = document.evaluate(
      '//input[' + types + ']', document, null, 7, null);
  for (i = 0; i < inputs.snapshotLength; i++) {
    item = inputs.snapshotItem(i);
    if (item.name.length === 0) {
      continue;
    }

    storageName = item.name + '_' + item.type;
    switch (item.type) {
      case 'radio':
        if (item.checked) {
          writeData[storageName] = item.value;
        }
        break;
      case 'checkbox':
        writeData[storageName] = item.checked;
        break;
      case 'text':
        writeData[storageName] = trim(item.value);
        break;
      case 'number':
        writeData[storageName] = parseInt(item.value, 10);
        break;
    }
  }

  var textareas = document.evaluate('//textarea', document, null, 7, null);
  for (i = 0; i < textareas.snapshotLength; i++) {
    item = textareas.snapshotItem(i);
    if (item.name.length === 0) {
      continue;
    }

    storageName = item.name + '_' + item.tagName.toLowerCase();
    writeData[storageName] = trim(item.value);
  }

  // writeData options.
  chrome.storage.local.set(writeData, function() {
    // writeDatad key catalog
    var debug = [];
    for (var key in writeData) {
      debug.push(key);
    }

    if (toType(callback) === 'function') {
      callback(debug);
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initTranslations(document, translation_path, 'Text');
  loadValues(document, default_values); // init
  loadValues(document, null, function() {
    var open_key = document.querySelector('input[name=open_key]');
    var currentKey = document.getElementById('current_key');
    currentKey.value = generateKeyString(JSON.parse(open_key.value));

    var key_tick = null;
    var state = document.getElementById('state');
    var setkey = document.getElementById('setkey');
    setkey.addEventListener('click', function() {
      state.style.display = 'block';

      var message = state.innerText;
      var dot = '';
      key_tick = setInterval(function() {
        dot = (dot.length < 3) ? dot + '.' : '';
        state.innerText = message + dot;
      }, 1000);
    });

    document.addEventListener('keyup', function(event) {
      if (!key_tick) {
        return;
      }

      clearInterval(key_tick);
      key_tick = null;
      state.style.display = 'none';

      var keyInfo = keyCheck(event);
      open_key.value = JSON.stringify(keyInfo);
      currentKey.value = generateKeyString(keyInfo);
    });

    /* options control */
    var config_view = document.getElementById('config_view');
    var config_view_status = document.getElementById('config_view_status');

    var status = document.getElementById('status');
    var timeoutTime = 1000;
    document.getElementById('save').addEventListener('click', function() {
      config_view.value = '';
      saveValues(document, ['text', 'checkbox'],
          function() {
            status.innerHTML = 'Options Saved.';
            setTimeout(function() {
              status.innerHTML = '';
            }, timeoutTime);
          }
      );
    }, false);
    document.getElementById('load').addEventListener('click', function() {
      loadValues(document, null, function() {
        currentKey.value = generateKeyString(JSON.parse(open_key.value));

        status.innerHTML = 'Options Loaded.';
        setTimeout(function() {
          status.innerHTML = '';
        }, timeoutTime);
      });
    }, false);
    document.getElementById('init').addEventListener('click', function() {
      loadValues(document, default_values, function() {
        currentKey.value = generateKeyString(JSON.parse(open_key.value));

        status.innerHTML = 'Options Initialized.';
        setTimeout(function() {
          status.innerHTML = '';
        }, timeoutTime);
      });
    }, false);

    // Import and Export
    document.getElementById('export').addEventListener('click', function() {
      chrome.storage.local.get(null, function(items) {
        config_view.value = JSON.stringify(items);
      });
    }, false);
    document.getElementById('import').addEventListener('click', function() {
      try {
        var items = JSON.parse(config_view.value);
        loadValues(document, items, function() {
          config_view_status.textContent = 'Success. Please, save.';
          config_view_status.style.color = 'green';
          setTimeout(function() {
            config_view_status.innerHTML = '';
          }, 1000);
        });
      } catch (error) {
        config_view_status.textContent = 'Import error. invalid string.';
        config_view_status.style.color = 'red';
      }
    }, false);
  });
});
