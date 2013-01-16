function init() {
    $("#profile").show();

    $("#tab_profile").click(tabclick);
    $("#tab_config").click(tabclick);
    $("#tab_imexport").click(tabclick);

    loadProfileList(loadProfileDetail);
    loadConfig();
    console.log("options init");
}

function tabclick() {
    var tab = $(this).data("tab");
    $("#tabs div").removeClass("selected").addClass("normal");
    $("#tabs #tab_" + tab).addClass("selected");
    $("#content div[type=tab]").hide();
    $("#content #" + tab).show();

    $("#control").data("tab", tab);

    if (tab == "profile") {
        loadProfileList(loadProfileDetail);
    }
}

function addNewProfile() {
    $("#profile_list li").removeClass("listed");
    var li = $("<li>", {
        "class" : "cell listed untitled",
        "click" : function() {
            $("#profile_list li").removeClass("listed");
            $(this).addClass("listed");
            $("#selectProfile").val($(this).data("profile"));
            loadProfileDetail();
        }
    }).append($("<span>", {
        "text" : chrome.i18n.getMessage("untitled")
    })).append($("<span>", {
        "text" : "---",
        "title" : chrome.i18n.getMessage("delete"),
        "click" : function() {
            var p = $(this).parent("li");
            if (p.hasClass("listed")) {
                p.remove();
                var first = $("#profile_list li:first").addClass("listed");
                $("#selectProfile").val(first.data("profile"));
                loadProfileDetail();
            } else {
                p.remove();
            }
            deleteProfile(p.data("profile"));
        }
    }));

    $("#profile_list").append(li);
    $("#profile_title").val(chrome.i18n.getMessage("untitled"))[0].select();
    $("#profile_desc").val("");
    $("#profile_hosts").val("");
}

function saveProfileName() {
    var title = $.trim($("#profile_title").val());
    if (title) {
        $("#profile_list li[class~=listed]").data("profile", title).find("span:first").text(title);
        $("#selectProfile").val(title);
        // _this.saveOptions();
    }
}

function deleteProfile(title) {
    var profiles = Settings.getProfiles();
    var display = Settings.getDisplay();
    profiles.list.remove(title);
    delete profiles.rules[title];
    delete profiles.hosts[title];
    Settings.setProfiles(profiles);
}

function saveProfile() {
    var title = $.trim($("#profile_title").val());
    var desc = $.trim($("#profile_desc").val()) || title;
    if (!title) {
        return;
    }

    var profiles = Settings.getProfiles();
    var display = Settings.getDisplay();

    var profile = {};
    profile.desc = desc;
    profile.host = checkhosts($("#profile_hosts").val());
    profiles.hosts[title] = profile;
    profiles.list.add(title);
    console.log(profiles);
    Settings.setProfiles(profiles);
}

function saveOptions() {
    var tab = $("#control").data("tab");
    if (tab == Tabs.PROFILE) {
        saveProfile();
    }
    chrome.extension.sendRequest({
        profile : Settings.getCurrentProfile(),
        source : "option"
    });
    $("#infoTip").show().fadeOut(3000);
}

function loadProfileList(callback) {
    $("#profile_list").empty();
    var profiles = Settings.getProfiles();
    for ( var i = 0; i < profiles.list.length; i++) {
        var title = profiles.list[i];
        var li = $("<li>", {
            "class" : "cell" + (i == 0 ? " listed" : ""),
            "data-profile" : title,
            "click" : function() {
                $("#profile_list li").removeClass("listed");
                $(this).addClass("listed");
                $("#selectProfile").val($(this).data("profile"));
                loadProfileDetail();
            }
        }).append($("<span>", {
            "text" : title,
            "title" : title
        })).append($("<span>", {
            "text" : "---",
            "title" : chrome.i18n.getMessage("delete"),
            "index" : i,
            "click" : function() {
                var p = $(this).parent("li");
                if (p.hasClass("listed")) {
                    p.remove();
                    var fi = $("#profile_list li:first").addClass("listed");
                    $("#selectProfile").val(fi.data("profile"));
                    loadProfileDetail();
                } else {
                    p.remove();
                }
                deleteProfile(p.data("profile"));
            }
        }));

        $("#profile_list").append(li);
    }
    $("#selectProfile").val(profiles.list[0]);

    if ($.isFunction(callback)) {
        callback.call();
    }
}

function loadProfileDetail() {
    var profiles = Settings.getProfiles();
    var display = Settings.getDisplay();
    var title = $("#selectProfile").val();
    if (title && profiles.hosts) {
        var profile = profiles.hosts[title];
        if (profile) {
            $("#profile_title").val(title);
            $("#profile_desc").val(profile.desc);
            $("#profile_hosts").val(profile.host);
        } else {
            $("#profile_title").val(title);
            $("#profile_desc").val("");
            $("#profile_hosts").val("");
        }
    }
}

function makeBackup() {
    var options = {};
    options.profiles = Settings.getProfiles();
    options.rules = Settings.getRules();
    saveFileAs("proxy.bak", JSON.stringify(options));
}

function saveFileAs(fileName, fileData) {
    try {
        var data = [];
        data.push(fileData);
        var bb = new Blob(data, {
            "type" : "text/plain"
        });
        saveAs(bb, fileName);
    } catch (e) {
        console.error("Oops! Can't save generated file, " + e.toString());
    }
}

function restore() {
    var rfile = $("#rfile")[0];
    if (rfile.files.length > 0 && rfile.files[0].name.length > 0) {
        var r = new FileReader();
        r.onload = function(e) {
            var options = JSON.parse(e.target.result);
            Settings.setProfiles(options.profiles);
            Settings.setRules(options.rules);
            $("#infoTip").find("span").text(chrome.i18n.getMessage("options_imexport_success")).end().show().fadeOut(3000);
        };
        r.onerror = function() {
            console.error("read backup file error.");
        };
        r.readAsText(rfile.files[0]);
        rfile.value = "";
    }
}

function loadConfig() {
    var display = Settings.getDisplay();
    if (display == "hosts") {
        $("#pdisplay_hosts").attr("checked", true);
    } else {
        $("#pdisplay_proxy").attr("checked", true);
    }
}

function saveDisplay() {
    var display = $(this).val();
    Settings.setDisplay(display);
}

var ippattern = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g;
var addrpattern = /([a-z0-9_]+[.]?)+/g;

function checkhosts(hosts) {
    if (!hosts) {
        return "";
    }
    var script = [];
    var hostList = hosts.split("\n");
    for ( var i = 0; i < hostList.length; i++) {
        var host = hostList[i];
        if (!host) {
            continue;
        }
        var ipaddr = host.split(/\s+/g);
        var ip = ipaddr[0];
        var addr = ipaddr[1];
        if (ip && addr) {
            script.push(host);
        } else {
            if (host.search("#") != 0) {
                host = "#" + host;
            }
            script.push(host);
        }
    }
    return script.join("\n");
}

function rule2hosts(ruleList) {
    var rules = Settings.getRules();
    var rulesDomain = rules.domain;
    var hosts = "";
    if (rulesDomain && ruleList) {
        for ( var i = 0; i < ruleList.length; i++) {
            var rule = ruleList[i];
            if (rule) {
                var domain = rulesDomain[rule];
                for ( var j = 0; j < domain.list.length; j++) {
                    var u = domain.list[j];
                    hosts += padip(rule) + " " + u + "\n";
                }
            }
        }
    }
    return hosts;
}

function hosts2rule(hosts) {
    var hostsList = hosts.split("\n");
    console.log(hostsList);
    for ( var i = 0; i < hostsList.length; i++) {
        var host = hostsList[i];
        if (host) {
            var ipaddr = host.split(/\s+/g);
            var ip = ipaddr[0];
            var addr = ipaddr[1];
            if (ip && addr) {

            }
        }
    }
}

function padip(ip) {
    var len = ip.length;
    for ( var i = 0; i < 18 - len; i++) {
        ip += " ";
    }
    if (len < 15) {
        for ( var i = 0; i < 14 - len; i++) {
            ip += " ";
        }
    }
    return ip;
}

$(function() {
    init();

    $("#profile_new").click(addNewProfile);
    $("#profile_title").blur(saveProfileName);
    $("#options_backup").click(makeBackup);
    $("#options_restore").click(function() {
        $("#rfile").click();
    });
    $("#rfile").change(restore);

    $("#button_save").click(saveOptions);
    $("#button_close").click(function() {
        window.close();
    });

    $("#pdisplay_hosts").click(saveDisplay);
    $("#pdisplay_proxy").click(saveDisplay);
});