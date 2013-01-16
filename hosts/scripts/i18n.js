$(function() {
    $("span,label,button,textarea").each(function() {
        if ($(this).data("i18n-text")) {
            $(this).text(chrome.i18n.getMessage($(this).data("i18n-text")));
        }
        if ($(this).data("i18n-title")) {
            $(this).attr("title", chrome.i18n.getMessage($(this).data("i18n-title")));
        }
    });
});