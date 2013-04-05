document.addEventListener('DOMContentLoaded', function() {
    chrome.extension.sendMessage({ 'getkey': true }, function(background_key) {
        var mes = document.getElementById('state');
        mes.innerText = background_key;

        var setkey = document.getElementById('setkey');
        setkey.addEventListener('click', function(e) {
            mes.innerText = 'You must press key.';

            var flag = true;
            document.addEventListener('keypress', function(ke) {
                if (flag) {
                    var error = document.getElementById('error');
                    var key = String.fromCharCode(ke.which).toUpperCase();
                    if (/[A-Z0-9]/.test(key)) {
                        mes.innerText = key;
                        localStorage['background_key'] = key;
                        error.innerText = '';
                    } else {
                        mes.innerText = background_key;
                        error.innerText = "'" + key + "' is not support key.";
                    }
                    flag = false;
                }
            }, false);
        }, false);
    });
});
