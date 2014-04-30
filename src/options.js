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
      element = document.evaluate(
          '//*[@name="' + key + '"]', document, null, 7, null);
      if (element.snapshotLength === 0) {
        console.log('loadValues() Get ' + key + ' error.');
        continue;
      }

      var value = items[key];
      switch (element.snapshotItem(0).type) {
        case 'radio':
          element = document.evaluate(
              '//input[@name="' + key + '"][@value="' + value + '"]',
              document, null, 7, null);
          if (element.snapshotLength !== 1) {
            console.log('loadValues() Get ' + key + ' error.');
            continue;
          }
          element.snapshotItem(0).checked = true;
          debugList.push(element.snapshotItem(0).name);
          break;
        case 'checkbox':
          element.snapshotItem(0).checked = value;
          debugList.push(element.snapshotItem(0).name);
          break;
        case 'number':
          element.snapshotItem(0).value = value;
          debugList.push(element.snapshotItem(0).name);
          break;
        case 'password':
        case 'text':
        case 'textarea':
          element.snapshotItem(0).value = trim(value);
          debugList.push(element.snapshotItem(0).name);
          break;
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

  var writeData = {};
  var inputs = document.evaluate(
      '//input[' + types + ']', document, null, 7, null);
  for (i = 0; i < inputs.snapshotLength; i++) {
    item = inputs.snapshotItem(i);
    if (item.name.length === 0) {
      continue;
    }

    switch (item.type) {
      case 'radio':
        if (item.checked) {
          writeData[item.name] = item.value;
        }
        break;
      case 'checkbox':
        writeData[item.name] = item.checked;
        break;
      case 'password':
      case 'text':
        writeData[item.name] = trim(item.value);
        break;
      case 'number':
        writeData[item.name] = item.value;
        break;
    }
  }

  var textareas = document.evaluate('//textarea', document, null, 7, null);
  for (i = 0; i < textareas.snapshotLength; i++) {
    item = textareas.snapshotItem(i);
    if (item.name.length === 0) {
      continue;
    }

    writeData[item.name] = trim(item.value);
  }

  // writeData options.
  chrome.storage.local.set(writeData, function() {
    if (toType(callback) === 'function') {
      // writeDatad key catalog
      var debug = [];
      for (var key in writeData) {
        debug.push(key);
      }

      callback(debug);
    }
  });
}

function keyInfoUpdate(area)
{
  var open_key = area.querySelector('input.keyJSON');
  var currentKey = area.querySelector('input.current');
  currentKey.value = generateKeyString(JSON.parse(open_key.value));
}

function keyBind(area)
{
  var open_key = area.querySelector('input.keyJSON');
  var currentKey = area.querySelector('input.current');
  currentKey.value = generateKeyString(JSON.parse(open_key.value));

  var key_tick = null;
  var state = area.getElementsByClassName('state')[0];
  var setkey = area.querySelector('button.setkey');
  setkey.addEventListener('click', function() {
    if (key_tick) {
      return;
    }

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
}

document.addEventListener('DOMContentLoaded', function() {
  initTranslations(document, translation_path, 'Text');
  loadValues(document, default_values); // init
  loadValues(document, null, function() {
    var open_background = document.getElementById('open_background');
    keyBind(open_background);
    var open_at_a_time = document.getElementById('open_at_a_time');
    keyBind(open_at_a_time);

    /* options control */
    var config_view = document.getElementById('config_view');
    var config_view_status = document.getElementById('config_view_status');

    var status = document.getElementById('status');
    var timeoutTime = 1000;
    document.getElementById('save').addEventListener('click', function() {
      config_view.value = '';
      saveValues(document, ['text', 'checkbox', 'number'],
          function() {
            status.innerHTML = 'Options Saved.';
            setTimeout(function() {
              status.innerHTML = '';
            }, timeoutTime);

            chrome.runtime.sendMessage({ event: 'update_feedly_tab' });
          }
      );
    }, false);
    document.getElementById('load').addEventListener('click', function() {
      loadValues(document, null, function() {
        keyInfoUpdate(open_background);
        keyInfoUpdate(open_at_a_time);

        status.innerHTML = 'Options Loaded.';
        setTimeout(function() {
          status.innerHTML = '';
        }, timeoutTime);
      });
    }, false);
    document.getElementById('init').addEventListener('click', function() {
      loadValues(document, default_values, function() {
        keyInfoUpdate(open_background);
        keyInfoUpdate(open_at_a_time);

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
