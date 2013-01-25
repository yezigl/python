$(function() {
    var options = {
        showOtherMonths : true,
        selectOtherMonths : true,
        changeMonth : false,
        dateFormat : "yy/mm/dd",
        regional : "zh_CN"
    };
    $("#holiday_date").datepicker(options);
    $("#home_date").datepicker(options);
    $("#free_date_from").datepicker(options);
    $("#free_date_to").datepicker(options);
    $("#reunion_date").datepicker(options);

    $("#addnewcm").bind("click", newcm);
    $("#addcm").bind("click", addcm);
    $("#addliuyan").bind("click", liuyan);
    $("#addly").bind("click", addly);
    $("input[name='shouqi']").click(function() {
        var to = $(this).data("to");
        $("#" + to).hide();
    });

});

function newcm(event) {
    var jtarget = $(event.target);
    var pos = jtarget.offset();
    var div = $("#newcm");
    div.css({
        "left" : (pos.left) + "px",
        "top" : (pos.top + 20) + "px"
    }).show();
}

function addcm() {
    if (!$("input[name='name']").val()) {
        alert("姓名不能为空");
        return;
    }
    $.post("/reunion/2013", {
        name : $("input[name='name']").val(),
        phone : $("input[name='phone']").val(),
        holiday_date : $("input[name='holiday_date']").val(),
        home_date : $("input[name='home_date']").val(),
        free_date : $("input[name='free_date_from']").val() + " - " + $("input[name='free_date_to']").val(),
        reunion_date : $("input[name='reunion_date']").val(),
        family : $("input[name='family']:checked").val(),
        remark : $("input[name='remark']").val(),
        type : "cm"
    }, function(data) {
        if (data == "ok") {
            // $("#newcm").hide();
            location.reload();
        }
    });
}

function liuyan(event) {
    var jtarget = $(event.target);
    var pos = jtarget.offset();
    var div = $("#liuyan");
    div.css({
        "left" : (pos.left) + "px",
        "top" : (pos.top + 20) + "px"
    }).show();
}

function addly() {
    $.post("/reunion/2013", {
        liuyan : $("textarea[name='liuyan']").val(),
        type : "ly"
    }, function(data) {
        if (data == "ok") {
            // $("#liuyan").hide();
            location.reload();
        }
    });
}
