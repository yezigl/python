/**
 * 
 */
$(function() {
    var sign = localStorage.xiami_date;
    var date = new Date();
    var fmt = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
    if (sign == fmt)
        return;

    $.post("http://www.xiami.com/task/signin", {}, function(data) {
        localStorage.xiami_date = fmt;
        $("#check_in").html(data + '天<span>已连续签到</span>').removeClass('checkin').addClass('checked');
    });

});
