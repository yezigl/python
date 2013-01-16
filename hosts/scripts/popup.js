/**
 * 
 */
var _profile = "_system";

function init() {
    loadProfiles();
}

function loadProfiles() {
    var cprofile = Settings.getCurrentProfile();
    var profiles = Settings.getProfiles();
    for (var i = 0; i < profiles.list.length; i++) {
        var profile = profiles.list[i];
        var rule = profiles.rules[profile] || profiles.hosts[profile];
        var checked = profile === cprofile;
        var div = $("<div>", {
            "class" : "item" + (checked ? " checked" : ""),
            "title" : rule.desc,
            "profile" : profile
        }).append($("<label>", {
            "class" : "icon"
        })).append($("<span>", {
            "text" : profile
        }));

        $("#profiles").append(div);
    }
    if (profiles.list.length > 0) {
        $("#profiles div.templateItem").hide();
    }
    $("#profiles div").each(function() {
        if ($(this).hasClass("item")) {
            $(this).click(function() {
                chrome.extension.sendRequest({
                    profile : $(this).attr("profile"),
                    source : "popup"
                });
                $("#profiles div").removeClass("checked");
                $(this).addClass("checked");
                window.close();
            });
        }
    });
    if (cprofile === this._profile || !cprofile) {
        $("#directConnection").addClass("checked");
    }
}

function noProxy() {
    chrome.extension.sendRequest({
        profile : "_system",
        source : "popup"
    });
    window.close();
}

function openOptions() {
    extension.open("options.html");
    window.close();
}

function showAbout() {

}

$(function() {
    init();
    
    $("#menuOptions").click(openOptions);
    $("#menuAbout").click(showAbout);
    $("#directConnection").click(noProxy);
});
