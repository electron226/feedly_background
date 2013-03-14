if (!opentab) {
    var opentab = function(e) {
        // Press key and Open a new tab in background.
        var background_key = 70;
        if (e.which != background_key) {
            return;
        }

        var entries = document.evaluate(
            '//div[contains(@class, "selectedEntry")]', document, null, 7, null);
        if (entries.snapshotLength != 1) {
            return;
        }
        var entry = entries.snapshotItem(0);

        var urls = document.evaluate(
            '//a[contains(@id, "' + entry.id + '_title")]',
            entry, null, 7, null);
        if (urls.snapshotLength != 1) {
            return;
        }

        var url = urls.snapshotItem(0).href;
        if (url) {
            chrome.extension.sendMessage({ "url" : url });
        }
    };
}

document.addEventListener("keydown", opentab, true);
