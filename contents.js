if (!opentab) {
    var opentab = function(e) {
        // Press key and Open a new tab in background.
        chrome.extension.sendMessage({ "getkey": true }, function(key) {
            if (e.which != key.charCodeAt(0)) {
                return;
            }

            // Find full preview
            var previews = document.evaluate(
                '//iframe[contains(@id, "quicklookContent")]',
                document, null, 7, null);
            if (previews.snapshotLength == 1) { // Found full preview
                var url = preview.snapShotItem(0).src;
            } else { // can't find full preview
                // Find select articles by using the mouse.
                var entries = document.evaluate(
                    '//td[contains(@class, "entryHolder")]',
                    document, null, 7, null);
                if (entries.snapshotLength != 1) {
                    // Find select articles by using the keyboard.
                    var entries = document.evaluate(
                        '//*[contains(@class, "selectedEntry")]',
                        document, null, 7, null);
                }
                var entry = entries.snapshotItem(0);
                var entryId = entry.id;

                // mini preview by using mouse.
                var i = entryId.lastIndexOf("_entryHolder");
                if (i != -1) {
                    // delete '_entryHolder'. add '_main'
                    entryId = entryId.substr(0, i) + "_main";
                } else {
                    // mini preview by using keyboard
                    var i = entryId.lastIndexOf("_abstract");
                    if (i != -1) {
                        // delete '_abstract'
                        entryId = entryId.substr(0, i);
                    }
                }

                // Find url of select articles.
                var urls = document.evaluate(
                    '//a[contains(@id, "' + entryId + '_title")]',
                    entry, null, 7, null);
                if (urls.snapshotLength != 1) {
                    return;
                }

                var url = urls.snapshotItem(0).href;
            }

            if (url) {
                // This extension will open url.
                chrome.extension.sendMessage({ "url": url });
            }
        });
    };
}

document.addEventListener("keydown", opentab, true);
