console.log("popup loaded")
let thumImags_data
let hrefs
let thumImags_text
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let tab = tabs[0];

    console.log(tab.id)
    chrome.runtime.sendMessage(
        { action: "popupjs", data: tab.id }
        , (response) => {
            console.log("popup_response")
            if (response.action === "background_thumImags_data") {
                let responsedata = response.data
                thumImags_data = response.data.thumImags_data
                hrefs = response.data.hrefs

                console.log(responsedata, "responsedata")
                for (let i = 0; i < hrefs.length; i++) {
                    let newdiv = document.createElement("div")
                    newdiv.style.height = "100px"
                    newdiv.style.width = "120px"
                    newdiv.style.margin = "10px"
                    newdiv.style.padding = "5px"
                    newdiv.style.background = "#d6d6d6"
                    newdiv.style.display = "flex"
                    newdiv.style.alignItems = "center"
                    newdiv.style.justifyContent = "center"
                    newdiv.style.textAlign = "center" 
                    newdiv.id = hrefs[i].id
                    newdiv.textContent = hrefs[i].text
                    newdiv.style.fontSize = "15px";
                    
                    console.log(newdiv)
                    document.getElementById("display").appendChild(newdiv);


                }

            }
        }
    )
});

//popup.htmlに表示された作品群をクリックすると別タブでその作品ページが開かれ、そこでdownloadContent.jsがDownloadする




document.getElementById("display").addEventListener("click", (a) => {
    let url = hrefs[a.target.id].href
    console.log(url, "url")
    chrome.tabs.create({
        url: url,
        active: false
    }, (newtab) => {
        console.log(a.target.textContent);
        chrome.runtime.sendMessage(
            { action: "newtab_url", data: url, illust_text: a.target.textContent }
        )
    })
})



/*
やりたいこと
poppup.jsが読み込まれたらbackgroundを経由しcontent.jsに働きかける
content.jsが作品一覧から、サムネイルに使われているimgタグのsrcと作品につながるhref、この2つを関連付けるidを取得し、そのデータ配列をbackgroundを経由しpopup.jsに送る
受け取ったpopup.jsが、createElementでimgタグを作り、content.jsから受け取ったsrcとidを入れ、popup.htmlに表示　←画像アドレスが制限されてたので画像のかわりに作品タイトルを表示
画像がクリックされたかを検知し、idでその画像と関連づいているhrefを指定する
指定されたhrefをバックグラウンドで開き、downloadContent.jsがページがロードされたかを検知、ロードしたページがダウンロード予定かを確認する
そうだった場合、最大画質のイラストにつながっているhrefを全て取得し、取得したhrefをbackground.jsで非アクティブでcreateする
非アクティブで開いた最大画質のイラストがあるタブを全てDownload
ダウンロード用に非アクティブで開いたタブを全て閉じる
ひとまず完成

追加したいこと
画像の名前が作品名になるようにしたい：できた
今はを一つずつしか作品をダウンロードできないが、作品を複数選択してダウンロードできるようにしたい
漫画もDownloadできるようにしたい

Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received
Uncaught (in promise) Error: No tab with id: 1404491429.

*/

//進捗
//完全に詰まった、pixivの作品のイラストを全て表示するには0番目のイラストをクリックする必要があるのは知っていたが、
//クリックされるとどこかにあるscriptを動かして、i.pximg.netというサーバーにリクエストを送って画像を追加するという手法だったようだ
//そのため、クリックしていない状態では1番目以降のイラストが存在しない。
// ダウンロードは非アクティブのタブで行うのでクリックはできない。どうしよう
//イラストの画像の名前の途中に何枚目の画像かが入っているじゃないか。勝った