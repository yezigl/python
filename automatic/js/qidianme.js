/**
 * 
 */
$(function() {
    var sign = localStorage.qidianme_date;
    var date = new Date();
    var fmt = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();

    if (sign == fmt)
        return;
    
    var gift = "http://me.qidian.com/Ajax/TodayGifts.aspx?random=" + Math.random();
    $.get(gift, function(data) {
        console.log("gift loaded.");
    });

    setTimeout(function(){
        chrome.extension.sendMessage({
            action : "qclose"
        });
    }, 3000);
    
    localStorage.qidianme_date = fmt;
});
