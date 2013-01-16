var hp = new Proxy();

chrome.extension.onRequest.addListener(onRequest);

function onRequest(request, sender, callback) {
    var profile = request.profile;
    var type;
    if (profile == "_system") {
        type = Proxy.ProxyType.SYSTEM;
        chrome.browserAction.setTitle({
            title : chrome.i18n.getMessage("name")
        });
    } else {
        var profiles = Settings.getProfiles();
        var hosts = profiles.hosts[profile];
        if (hosts && hosts.host) {
            type = Proxy.ProxyType.PAC;
        } else {
            type = Proxy.ProxyType.DIRECT;
        }
        chrome.browserAction.setTitle({
            title : profile + " - " + chrome.i18n.getMessage("name")
        });
    }

    Settings.setCurrentProfile(profile);
    hp.proxy = hp.generateProxyConfig(type);
    if (request.source == "popup")
        chrome.tabs.reload();
    console.log(hp.proxy.regular.mode);
};

function init() {
    var profile = Settings.getCurrentProfile();
    if (profile && profile !== "_system") {
        chrome.browserAction.setTitle({
            title : profile + " - " + chrome.i18n.getMessage("name")
        });
    }
}

var version = chrome.app.getDetails().version;
if (Settings.getValue("version") != version) {
    loadDefault();
    Settings.setValue("version", version);
    init();
} else {
    init();
}

function loadDefault() {
    var xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", "proxy.bak", false);
    xmlHttpReq.onreadystatechange = function() {
        if (xmlHttpReq.readyState == 4) {
            var js = xmlHttpReq.responseText;
            var obj = JSON.parse(js);
            Settings.setProfiles(obj.profiles);
        }
    };
    xmlHttpReq.send();
}

//chrome.webRequest.onBeforeRequest.addListener(function(info) {
//    console.log(info);
//}, {
//    urls : [ "http://*/*", "https://*/*", ]
//});