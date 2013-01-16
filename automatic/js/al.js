/**
 * 
 */
function parseUrl() {
    var params = {};
    var search = location.search;
    if (search) {
        search = search.replace("?", "");
        var pstrs = search.split("&");
        for ( var i = 0; i < pstrs.length; i++) {
            var pstr = pstrs[i];
            var p = pstr.split("=");
            if (p[0] && p[1]) {
                params[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);
            }
        }
    }
    return params;
}

function radio(id, sel) {
    var html = "<input type=\"radio\" name=\"" + id + "\" sel=\"" + id + "\" value=\"" + sel + "\">";
    html = html + "<label for='" + id + "'>" + sel + "</label><br>";
    return html;
}

function selector(sel) {
    var s = "input";
    if (sel.id) {
        s += "[id='" + sel.id + "']"
    }
    if (sel.name) {
        s += "[name='" + sel.name + "']"
    }
    if (sel.type) {
        s += "[type='" + sel.type + "']"
    }
    return s;
}

$(function() {
    var params = parseUrl();
    if (params.scan) {
        var al = JSON.parse(params.scan);
        console.log(al);
        var un = $("#username_list");
        var pw = $("#password_list");
        var sb = $("#submit_list");
        for ( var i = 0; i < al.username.length; i++) {
            un.html(un.html() + radio("username", selector(al.username[i])));
        }
        if (!al.username || al.username.length <= 0) {
            un.html("<input type=\"text\" name=\"username\" sel=\"username\">");
        }
        for ( var i = 0; i < al.password.length; i++) {
            pw.html(pw.html() + radio("password", selector(al.password[i])));
        }
        if (!al.password || al.password.length <= 0) {
            un.html("<input type=\"test\" name=\"password\" sel=\"password\">");
        }
        for ( var i = 0; i < al.submit.length; i++) {
            sb.html(sb.html() + radio("submit", selector(al.submit[i])));
        }
        if (!al.username || al.submit.length <= 0) {
            un.html("<input type=\"text\" name=\"submit\" sel=\"submit\">");
        }
    }
    loadAccount();
    $("label[type='submit']").click(add);
});

function add() {
    var unsel, pwsel, sbsel;
    var uns = $("input[sel='username']");
    if (uns.length == 1) {
        unsel = uns.val();
    } else {
        uns.each(function() {
            if (this.checked) {
                unsel = this.value;
            }
        });
        if (!unsel) {
            unsel = uns.get(0).value;
        }
    }
    var pws = $("input[sel='password']");
    if (pws.length == 1) {
        pwsel = pws.val();
    } else {
        pws.each(function() {
            if (this.checked) {
                pwsel = this.value;
            }
        });
        if (!pwsel) {
            pwsel = pws.get(0).value;
        }
    }
    var sbs = $("input[sel='submit']");
    if (sbs.length == 1) {
        sbsel = sbs.val();
    } else {
        sbs.each(function() {
            if (this.checked) {
                sbsel = this.value;
            }
        });
        if (!sbsel) {
            sbsel = sbs.get(0).value;
        }
    }
    chrome.extension.sendMessage({
        action : "tabmsg"
    }, function(response) {
        var site = new Site({
            name : response.title,
            url : response.url,
            unsel : unsel,
            pwsel : pwsel,
            sbsel : sbsel
        });

        var sact = $("#account").val();
        if (sact != "...") {
            var account = Settings.getAccount(sact);
            console.log(account);
            account.add(site);
            Settings.set(account);
        } else {
            Settings.addSiteList(site);
        }
    });
}

function loadAccount() {
    var list = Settings.getAccountList();
    console.log(list);
    var html = $("<select>", {
        "id" : "account",
        "style" : "margin-left: 30px;",
        "width" : "130px",
        "height" : "20px",
        "text-align" : "right"
    }).append($("<option>", {
        "text" : "..."
    }));
    if (list && list.length > 0) {
        for ( var i = 0; i < list.length; i++) {
            html.append($("<option>", {
                "value" : list[i],
                "text" : list[i]
            }));
        }
        $("#saccount").append(html);
    }
}