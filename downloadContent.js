
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "popupjs_for_downloadContent") {
        console.log("aaaaaaqaaaaaaaaa")
    }
})

//ロードされたタブがダウンロードするために開かれたタブかを確認
//yesと返ってきたら、Downloadを開始する
window.addEventListener("load", () => {
    chrome.runtime.sendMessage(
        { action: "whattab" }, (response) => {
            if (response.action === "sakuhintab") {
                console.log("yeeeeees")
                let atagu = document.querySelectorAll("a");
                let img_href = ""
                for (const item of atagu) {
                    if (item.className === "sc-fddeba56-3 fKiyhO") {
                        img_href = item.href
                    }
                    if (item.className === "sc-fddeba56-3 cbztnE gtm-expand-full-size-illust") {
                        img_href = item.href
                    }
                }
                console.log(img_href, "img_hrefs");
                //イラスト数を調べる

                let illustsuu_alldiv = document.querySelectorAll("div")
                let illustsuu_div
                let illustsuu
                for (const item1 of illustsuu_alldiv) {
                    if (item1.className === "sc-71e93a98-0 iysDEK") {
                        illustsuu_div = item1
                        illustsuu = illustsuu_div.querySelector("span").textContent
                        illustsuu = illustsuu.slice(2)
                    }
                }
                //イラスト数を表示するdivが存在しない場合、それはイラストが一枚しかないから
                if (illustsuu_div === undefined) {
                    illustsuu = "1"
                }

                console.log(illustsuu, "illustsuu")


                chrome.runtime.sendMessage(
                    { action: "create_imgtab", img_href: img_href, illustsuu: illustsuu }
                )

            }
            if (response.action === "imgtab") {

                //イラスト数回繰り返す
                for (let q = 0; q < response.illustsuu; q++) {

                    //1部コピペ
                    (async () => {
                        let fullurl = response.senderurl
                        let firstUrl = fullurl.slice(0, -5)
                        let lastUrl = fullurl.slice(-4)
                        console.log(fullurl, firstUrl, lastUrl, "qwsdsdfvsewvgfsw");
                        const url = firstUrl + String(q) + lastUrl
                        try {
                            const res = await fetch(url, {
                                headers: {
                                    "Referer": "https://www.pixiv.net/"
                                },
                                credentials: "include"
                            });

                            console.log("status:", res.status);

                            const blob = await res.blob();
                            const blobUrl = URL.createObjectURL(blob);

                            chrome.runtime.sendMessage({
                                action: "downloadBlob",
                                blobUrl: blobUrl,
                                illust_index:String(q),
                                lastUrl:lastUrl
                            });
                            await new Promise(r => setTimeout(r, 1000));
                        } catch (e) {
                            console.error(e);
                        }
                        if (q === response.illustsuu - 1) {
                            chrome.runtime.sendMessage(
                                { action: "tabRemove" }
                            )
                        }
                    })();

                }

            }
        }
    )
});
