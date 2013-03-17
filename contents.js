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
            } else { // can't find  fullpreview
                // Find select entry
                var entries = document.evaluate(
                    '//div[contains(@class, "selectedEntry")]',
                    document, null, 7, null);
                if (entries.snapshotLength != 1) {
                    // Find select entry which used mouse.
                    entries = document.evaluate(
                        '//table[contains(@class, "selectedEntry")]',
                        document, null, 7, null);
                }
                var entry = entries.snapshotItem(0);
                var entryId = entry.id;

                // Do select entry is mini preview?
                var i = entryId.lastIndexOf("_abstract");
                if (i != -1) {
                    // delete '_abstract' or '_entryHolder'
                    entryId = entryId.substr(0, i);
                }

                // Find url of select entry.
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
