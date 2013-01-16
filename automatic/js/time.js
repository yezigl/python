/**
 * 显示网页载入时的时间
 */
$(function() {
    $("body").append("<div id='_popup_'><span id='_title_'></span>&nbsp;&nbsp;<span id='_time_'></span></div>");

    var date = new Date();
    var timeStr = date.getHours() + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
    // var title;
    // chrome.extension.sendRequest({
    // "action" : "time"
    // }, function(response) {
    // title = response.title;
    // });

    var pop = $("#_popup_").addClass("_popup_");
    pop.find("#_title_").text(document.characterSet);
    pop.find("#_time_").text(timeStr);
});

function pad(t) {
    if (t < 10) {
        return "0" + t;
    }
    return t;
}