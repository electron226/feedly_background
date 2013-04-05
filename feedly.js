/**
* コンテンツスクリプトからメッセージを取得し処理。
*/
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.getkey) {
            var key = localStorage['background_key'];
            if (key == undefined || key == null) {
                key = "I"; // default key
            }
            sendResponse( key.toUpperCase() );
        }

        if (request.url) {
            chrome.tabs.create( { "url": request.url, "active": false });
        }
    }
)
