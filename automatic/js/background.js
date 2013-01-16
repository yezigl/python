/**
 * 
 */

var accountList = Settings.get(Key.ACTLIST) || {};

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    var action = request.action;
    //console.log(request);
    //console.log(sender);
    if (action == "islogin" && sender.tab && accountList) {
        var url = sender.tab.url;
        for ( var i = 0; i < accountList.length; i++) {
            var actname = accountList[i];
            account = Settings.getAccount(actname);
            var match = account.match(url);
            console.log(match);
            if (match) {
                sendResponse(match);
            }
        }
    } else if (request.action == 'gift') {
        var gift = "http://me.qidian.com/Index.aspx";
        chrome.tabs.create({
            url : gift,
            active : false
        }, function(tab) {

        });
    } else if (request.action == "qclose") {
        chrome.tabs.remove(sender.tab.id);
    } else if (request.action == "page") {
        chrome.pageAction.show(sender.tab.id);
    } else if (request.action == "tabmsg") {
        sendResponse({
            title : sender.tab.title,
            url : sender.tab.url
        });
    }
});

chrome.pageAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(tab.id, {
        file  : "js/scan.js"
    });
});
/*
 * chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
 * 
 * var headers = details.requestHeaders; details.requestHeaders[headers.length] =
 * {name:"Referer", value:"http://me.qidian.com/Index.aspx"};
 * console.log(details); return {requestHeaders: details.requestHeaders}; }, {
 * urls : [ "<all_urls>" ] }, [ "requestHeaders" ]);
 */