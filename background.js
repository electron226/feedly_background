/**
* この拡張機能外のスクリプトを使って行う初期化処理 
* @return なし
*/
function Init()
{
    console.log("Extension Initialized.");
}

/**
 * 拡張機能がインストールされたときの処理
 * @return なし
 */
function onInstall() {
    console.log("Extension Installed.");
}

/**
 * 拡張機能がアップデートされたときの処理
 * @return なし
 */
function onUpdate() {
    console.log("Extension Updated.");
}

/**
 * 拡張機能のバージョンを返す
 * @return {String} 拡張機能のバージョン
 */
function getVersion() {
    var details = chrome.app.getDetails();
    return details.version;
}

document.addEventListener('DOMContentLoaded', function() {
    // この拡張機能外のスクリプトを使って行う初期化処理
    Init();

    // この拡張機能のバージョンチェック
    var currVersion = getVersion();
    var prevVersion = localStorage['version'];
    if (currVersion != prevVersion) {
        // この拡張機能でインストールしたかどうか
        if (typeof prevVersion == 'undefined') {
            onInstall();
        } else {
            onUpdate();
        }
        localStorage['version'] = currVersion;
    }
});
