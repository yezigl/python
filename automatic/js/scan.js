var auto = {
    username : [],
    password : [],
    submit : []
};

$("input[type='text']").each(function(i) {
    var id = $(this).attr("id");
    var name = $(this).attr("name");
    if (id || name) {
        var un = {
            "id" : id,
            "name" : name
        };
        auto.username.push(un);
    }
});

$("input[type='password']").each(function() {
    var id = $(this).attr("id");
    var name = $(this).attr("name");
    if (id || name) {
        var pw = {
            "id" : id,
            "name" : name
        };
        auto.password.push(pw);
    }
});

$("input:visible[type='submit']").each(function() {
    var id = $(this).attr("id");
    var name = $(this).attr("name");
    var sb = {
        "type" : "submit",
        "id" : id,
        "name" : name
    };
    auto.submit.push(sb);

});
$("input:visible[type='button']").each(function() {
    var id = $(this).attr("id");
    var name = $(this).attr("name");
    var sb = {
        "type" : "button",
        "id" : id,
        "name" : name
    };
    auto.submit.push(sb);
});

var width = $(document.body).width();
var height = $(document.body).height();

var iframe = $("<iframe>", {
    "src" : "chrome-extension://" + chrome.i18n.getMessage("@@extension_id") + "/tpl/al.html?scan=" + JSON.stringify(auto),
    "style" : "position: fixed; right: 20px; top: 20px; background: transparent; border: none; width: 320px;",
    "scrolling" : "no"
});

$(document.body).append(iframe);
