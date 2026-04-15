
let illustsuu_background
let illust_name = ""
let DownloadUrls = [] //downloadContentがロードしたページがダウンロード予定かを調べる用のDownload予定url集
let usedDownloadUrls = [] //用済みurl。ダウンロードのために非アクティブで開いたタブを消す用
let imgDownloadUrls = [] //Download予定の最大画質イラストが表示されたurl
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "popupjs") {
        //popup.jsから送られてきたタブidを使いcontentにメッセージを送りcontentを動かす
        chrome.tabs.sendMessage(message.data,
            { action: "background" },
            (response) => {
                if (response.action === "content_thumImags_data") {

                    sendResponse({ action: "background_thumImags_data", data: response.data });
                }
            }
        )
    }



    //Download予定の作ったタブのurlを保存する。
    // downloadContent.jsがロードを完了したら自身のタブが、Download予定かを調べにきて、そうだった場合は、yesと返し、配列からそのurlを一つ消す
    if (message.action === "newtab_url") {
        DownloadUrls.push(message.data)
        console.log(message.illust_text, DownloadUrls, "DownloadUrls")
        illust_name = message.illust_text
    }

    if (message.action === "whattab") {
        if (DownloadUrls.includes(sender.url)) {
            DownloadUrls.splice(DownloadUrls.indexOf(sender.url), 1);
            usedDownloadUrls.push(sender.url)
            sendResponse({ action: "sakuhintab" })
        }
        if (imgDownloadUrls.includes(sender.url)) {
            sendResponse({ action: "imgtab", senderurl: sender.url, illustsuu: Number(illustsuu_background) })
            let firstUrl = sender.url.slice(0, -5 - illustsuu_background.length + 1)
            let lastUrl = sender.url.slice(-4)
            console.log(firstUrl, lastUrl, -5 - illustsuu_background.length + 1, "lastUrl");
        }

    }

    if (message.action === "create_imgtab") {
        chrome.tabs.create({
            url: message.img_href,
            active: false
        }, (newtab) => {
            imgDownloadUrls.push(message.img_href)
            console.log(message.img_href, "img_href");
            console.log(imgDownloadUrls, "imgDownloadUrls");
            console.log("create_imgtab_create");
            console.log(message.illustsuu, "message.illustsuu");
            illustsuu_background = message.illustsuu

        })

    }

    return true;
});

//コピペ
const urlToFilename = new Map();
chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
    if (urlToFilename.has(item.url)) {
        suggest({
            filename: urlToFilename.get(item.url),
            conflictAction: "uniquify"
        });
        urlToFilename.delete(item.url);
    } else {
        suggest();
    }
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "downloadBlob") {
        const blobUrl = message.blobUrl;
        urlToFilename.set(blobUrl, illust_name + message.illust_index + message.lastUrl);
        chrome.downloads.download({
            url: message.blobUrl,
            //filename: message.illust_index + message.lastUrl,
            saveAs: true,
            conflictAction: "uniquify"
        });
        console.log(message.illust_index + message.lastUrl, "message.illust_index + message.lastUrl");
    }
    //ここはコピペじゃない
    //非アクティブで開いたタブを閉じる
    if (message.action === "tabRemove") {
        let deleteUrls = usedDownloadUrls
        deleteUrls = deleteUrls.concat(imgDownloadUrls)
        console.log(imgDownloadUrls);
        console.log(deleteUrls)
        chrome.tabs.query({}, (tabs) => {
            for (const item1 of tabs) {
                for (const item2 of deleteUrls) {
                    if (item1.url.includes(item2)) {
                        chrome.tabs.remove(item1.id);


                    }
                }
            }
        });
    }
});
