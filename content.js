console.log("content loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "background") {
        //ページ内のaタグをすべて取得
        let atagu = document.querySelectorAll("a");
        let hrefs = []
        let img_count2 = 0
        //クラスネームを使い、aタグのうちhrefがついているaタグを残す
        for (const item of atagu) {
            if (item.className === "sc-73523aef-6 jxMuTw") {
                hrefs.push({
                    href: item.href,
                    id: String(img_count2),
                    text: item.textContent
                })
                img_count2++
            }
        }
        console.log(hrefs, "hrefs")
        //ページ内のimgタグをすべて取得
        let images = document.querySelectorAll("img");
        console.log(images, "images");
        let thumImags_data = []
        //クラスネームを使い、imgのうちサムネに使われているimgを残す
        let img_count = 0;
        for (const item of images) {

            if (item.className === "sc-20eee990-10 fvVfUh") {
                thumImags_data.push({
                    src: item.src,
                    id: String(img_count),
                })
                img_count++
            }
        }
        console.log(thumImags_data, "thumImags_data");
        sendResponse({ action: "content_thumImags_data", data: { thumImags_data: thumImags_data, hrefs: hrefs } });

    }


    return true;
})