/*jshint globalstrict: true, maxlen: 100, unused: false*/
"use strict";

// Default Values. use InitValues Function.
if (!default_values) {
  var default_values = {
    'open_key_text': JSON.stringify(
      { ctrl: false, alt: false, shift: false, meta: false, keyCode: 73 }),
    'allopen_key_text': JSON.stringify(
      { ctrl: true, alt: false, shift: false, meta: false, keyCode: 73 }),
    'open_number_number': 10,
    'all_background_checkbox': false,
  };
} else {
  throw new Error("Can't define the variable of the default_values.");
}

if (!translation_path) {
  var translation_path = chrome.runtime.getURL('_locales/ja/messages.json') ||
                         chrome.runtime.getURL('_locales/en/messages.json');
} else {
  throw new Error("Can't define the variable of the translation_path.");
}

// get data from assignment file.
// then search class in the document.
// and change string of its element inside.
if (!initTranslations) {
  var initTranslations = function(document, load_file, suffix) {
    if (document === void 0 ||
        toType(load_file) !== 'string' ||
        toType(suffix) !== 'string') {
      throw new Error('Invalid type of arguments.');
    }

    var request = new XMLHttpRequest();
    request.onload = function() {
      var translations = JSON.parse(this.responseText);
      for (var key in translations) {
        var el = document.getElementsByClassName(key + suffix);
        var message = chrome.i18n.getMessage(key);
        for (var j = 0; j < el.length; j++) {
          var string = el[j].innerHTML;
          var index = string.lastIndexOf('</');
          el[j].innerHTML = string.substring(0, index) +
                            message + string.substring(index);
        }
      }
    };
    request.open('GET', load_file, true);
    request.send(null);
  };
} else {
  throw new Error("Can't define the function of the initTranslations.");
}

if (!keyCheck || !generateKeyString) {
  /**
   * keyCheck
   * return key information object.
   *
   * @param {Event} e Event on keypress, keydown or keyup.
   * @return {Object} object of key information.
   */
  var keyCheck = function(e) {
    if (e === void 0) {
      throw new Error("Invalid argument. don't get event object.");
    }

    return {
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey,
      meta: e.metaKey,
      keyCode: e.keyCode
    };
  };

  /**
   * generateKeyString
   * Based on key info create string.
   *
   * @param {Object} keyInfo has got return value of keyCheck function.
   * @return {String} result string.
   */
  var generateKeyString = generateKeyString || function(keyInfo) {
    if (toType(keyInfo) !== 'object') {
      throw new Error('Invalid type of argument.');
    }

    var output = '';
    if (keyInfo.meta) { output += 'Meta +'; }
    if (keyInfo.ctrl) { output += 'Ctrl +'; }
    if (keyInfo.alt) { output += 'Alt +'; }
    if (keyInfo.shift) { output += 'Shift +'; }

    output += ' ';

    /* refernece to
     * http://www.javascripter.net/faq/keycodes.htm */
    switch (keyInfo.keyCode) {
      case 8: output += 'BackSpace'; break;
      case 9: output += 'Tab'; break;
      case 12: output += 'Numpad 5'; break;
      case 13: output += 'Enter'; break;
      case 19: output += 'Pause'; break;
      case 20: output += 'CapsLock'; break;
      case 27: output += 'Esc'; break;
      case 32: output += 'Space'; break;
      case 33: output += 'Page Up'; break;
      case 34: output += 'Page Down'; break;
      case 35: output += 'End'; break;
      case 36: output += 'Home'; break;
      case 37: output += 'Left'; break;
      case 38: output += 'Up'; break;
      case 39: output += 'Right'; break;
      case 40: output += 'Down'; break;
      case 44: output += 'PrintScreen'; break;
      case 45: output += 'Insert'; break;
      case 46: output += 'Delete'; break;
      case 106: output += 'Numpad*'; break;
      case 107: output += 'Numpad+'; break;
      case 109: output += 'Numpad-'; break;
      case 110: output += 'Numpad.'; break;
      case 111: output += 'Numpad/'; break;
      case 144: output += 'NumLock'; break;
      case 145: output += 'ScrollLock'; break;
      case 188: output += ','; break;
      case 190: output += '.'; break;
      case 191: output += '/'; break;
      case 192: output += '`'; break;
      case 219: output += '['; break;
      case 220: output += '\\'; break;
      case 221: output += ']'; break;
      case 222: output += '\''; break;
      default:
        if (48 <= keyInfo.keyCode && keyInfo.keyCode <= 57 || // 0 to 9
            65 <= keyInfo.keyCode && keyInfo.keyCode <= 90) { // A to Z
          output += String.fromCharCode(keyInfo.keyCode);
        } else if (96 <= keyInfo.keyCode && keyInfo.keyCode <= 105) {
          // Numpad 0 to Numpad 9
          output += 'Numpad ' + (keyInfo.keyCode - 96);
        } else if (112 <= keyInfo.keyCode && keyInfo.keyCode <= 123) {
          // F1 to F12
          output += 'F' + (keyInfo.keyCode - 111);
        } else {
          throw new Error('Invalid keyCode.');
        }
        break;
    }

    return output;
  };
} else {
  throw new Error('already exists function name.' +
                  ' "keyCheck" and "generateKeyString"');
}

if (!toType) {
  /* base program.
   * http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
   */
  var toType = function(obj) {
    var type = ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    if (type === 'global') {
      if (obj === void 0) { return 'undefined'; }
      if (obj === null) { return 'null'; }
    }
    return type;
  };
} else {
  throw new Error("Can't define the function of the toType.");
}

if (!trim) {
  var trim = function(string) {
    if (toType(string) !== 'string') {
      throw new Error('Argument error. used not string object.');
    }
    return string.replace(/(^\s+)|(\s+$)/g, '');
  };
} else {
  throw new Error("Can't define the function of the trim.");
}

if (!compareObject) {
  var compareObject = function(leftObj, rightObj) {
    if (leftObj === void 0 || rightObj === void 0) {
      throw new Error('Invalid type of arguments.');
    }

    var key;
    for (key in leftObj) {
      if (!rightObj.hasOwnProperty(key) || leftObj[key] !== rightObj[key]) {
        return false;
      }
    }

    for (key in rightObj) {
      if (!leftObj.hasOwnProperty(key) || leftObj[key] !== rightObj[key]) {
        return false;
      }
    }
    return true;
  };
} else {
  throw new Error("Can't define the function of the compareObject.");
}

if (!unique) {
  var unique = function(array) {
    if (toType(array) !== 'array') {
      throw new Error('Argument error. used not array object.');
    }

    var tempdict = {};
    var ret = [];
    for (var i = 0; i < array.length; i++) {
      var val = array[i];
      if (!(val in tempdict)) {
        tempdict[val] = true;
        ret.push(val);
      }
    }

    return ret;
  };
} else {
  throw new Error("Can't define the function of the unique.");
}

if (!arrayEqual) {
  var arrayEqual = function(x1, x2) {
    if (x1.length !== x2.length) {
      return false;
    }

    var i = 0, j = 0;
    while (i < x1.length && j < x2.length) {
      if (x1[i] !== x2[j]) {
        return false;
      }
      i++;
      j++;
    }
    return true;
  };
} else {
  throw new Error("Can't define the function of the arrayEqual.");
}

if (!sleep) {
  // ブラウザの応答性は下がる(ビジーウェイト)
  var sleep = function(T) {
    var d1 = new Date().getTime();
    var d2 = new Date().getTime();
    while (d2 < d1 + T) {
      d2 = new Date().getTime();
    }
  };
} else {
  throw new Error("Can't define the function of the sleep.");
}
