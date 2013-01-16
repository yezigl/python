/**
 * 
 */
// "/Ajax/TodayGifts.aspx?nowScore={0}&nextScore={1}&random={2}"
$(function() {
    var sign = localStorage.qidian_date;
    var date = new Date();
    var fmt = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();

    if (sign == fmt)
        return;

    chrome.extension.sendMessage({
        action : "gift"
    });
    var pet = "http://me.qidian.com/pet/myPet.aspx";
    $.get(pet, function(data) {
        console.log("pet loaded.");
    });

    // var gift = "http://me.qidian.com/Ajax/TodayGifts.aspx?random=" +
    // Math.random();
    // $.get(gift, function(data) {
    // console.log(data);
    // });

    localStorage.qidian_date = fmt;
});

function notify() {
    chrome.extension.sendMessage({
        action : "gift"
    });
    chrome.extension.sendMessage({
        action : "pet"
    });
}
