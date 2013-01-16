function login(response) {
    console.log("content script receive response : " + response);
    if (response) {
        jQuery(response.unsel).val(response.username);
        jQuery(response.pwsel).val(response.password);
        jQuery(response.sbsel).click();
    }
}

chrome.extension.sendMessage({
    action : "islogin"
}, login);

chrome.extension.sendMessage({
    action : "page"
});
