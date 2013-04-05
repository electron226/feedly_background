/**
* �R���e���c�X�N���v�g���烁�b�Z�[�W���擾�������B
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
