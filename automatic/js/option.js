var AccountList = [];

function addAccount() {
    var title = $("#accounttitle").val();
    var username = $("#username").val();
    var password = $("#password").val();
    var account = new Account({
        title : title,
        username : username,
        password : password
    });

    AccountList.add(account.key());
    Settings.setAccountList(AccountList);
    if ($("#selectAct").val() == title) {
        Settings.updateAccount(account);
    } else {
        Settings.set(account);
    }
}

function addSite() {
    var site = new Site({
        name : $("#sitename").val(),
        url : $("#url").val(),
        unsel : $("#unsel").val(),
        pwsel : $("#pwsel").val(),
        sbtsel : $("#sbtsel").val()
    });

    var selact = $("#selectAct").val();
    if (site.validate() && selact) {
        var account = Settings.getAccount(selact);
        account.add(site);
        console.log(account);
        Settings.set(account);
    } else {
        alert("没有选择账户");
    }
}

function loadAccount() {
    var val = Settings.getAccountList();
    if (val) {
        var list = val;
        var ul = $("<ul>");
        for ( var i = 0; i < list.length; i++) {
            var act = list[i];
            ul.append($("<li>", {
                "text" : act,
                "click" : function() {
                    $("#selectAct").val($(this).text());
                    var account = Settings.getAccount(act);
                    $("#accounttitle").val(account.title);
                    $("#username").val(account.username);
                    $("#password").val(account.password);
                }
            }));
        }
        $("#account_list").append(ul);
    }
}

$(function() {
    loadAccount();
    $("#addAccount").click(addAccount);
    $("#addSite").click(addSite);
});