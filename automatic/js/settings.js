var extension = window;

var Settings = {
    get : function(key) {
        var val = extension.localStorage[key];
        return val ? JSON.parse(val) : val;
    },
    set : function(key, value) {
        if (typeof key === "string") {
            extension.localStorage[key] = JSON.stringify(value);
        } else {
            extension.localStorage[key.key()] = JSON.stringify(key);
        }
    },
    getAccount : function(key) {
        var account = extension.localStorage[key];
        // console.log(account);
        var act = JSON.parse(account, Parser.Account);
        return act;
    },
    delSite : function(key, name) {
        var account = this.getAccount(key);
        account.del(name);
        this.set(account);
    },
    setAccountList : function(list) {
        this.set(Key.ACTLIST, list);
    },
    getAccountList : function() {
        return this.get(Key.ACTLIST);
    },
    addSiteList : function(site) {
        var list = this.getSiteList();
        list.push(site);
        this.set(Key.SITELIST, list);
    },
    getSiteList : function() {
        return this.get(Key.SITELIST) || [];
    },
    updateAccount : function(account) {
        var title = account.title;
        var oldact = this.getAccount(title);
        oldact.username = account.username;
        oldact.password = account.password;
        this.set(oldact);
    }
};

var Key = {
    "OPTION" : "option",
    "ACTLIST" : "account_list",
    "SITELIST" : "site_list"
};

var Parser = {
    Account : function(key, val) {
        if (!key) {
            return new (Account)(val);
        }
        return val;

    },
    Site : function(key, val) {

    }
};

function Account(account) {
    if (typeof account === "object") {
        this.title = account.title;
        this.username = account.username;
        this.password = account.password;
        this.siteList = account.siteList == undefined ? [] : account.siteList;
    }
}

Account.prototype.add = function(site) {
    if (this.has(site)) {
        return;
    }
    this.siteList.add(site);
}

Account.prototype.has = function(site) {
    if (typeof site != "object") {
        return true;
    }
    if (!site.url) {
        return true;
    }
    if (this.siteList == undefined) {
        return false;
    }
    for (var i = 0; i < this.siteList.length; i++) {
        var hsite = this.siteList[i];
        if (hsite.url.indexOf(site.url) >= 0 || site.url.indexOf(hsite.url) >=0) {
            return true;
        }
    }
    return false;
}

Account.prototype.key = function() {
    var tt = this.title;// + this.username + this.password;
    return tt;
}

Account.prototype.equals = function(obj) {
    if (this === obj) {
        return true;
    }
    if (obj === null) {
        return false;
    }
    if (this.title === obj.title && this.username === obj.username && this.password === obj.password) {
        return true;
    }
    return false;
}

Account.prototype.match = function(url) {
    var m = {};
    m.username = this.username;
    m.password = this.password;
    for ( var i = 0; i < this.siteList.length; i++) {
        var site = this.siteList[i];
        if (url.indexOf(site.url) >= 0) {
            m.unsel = site.unsel;
            m.pwsel = site.pwsel;
            m.sbsel = site.sbsel;
            return m;
        }
    }
    return null;
}

Account.prototype.del = function(name) {
    var index = -1;
    for ( var i = 0; i < this.siteList.length; i++) {
        var site = this.siteList[i];
        if (name == site.name) {
            index = i;
        }
    }
    if (index >= 0) {
        var a = this.siteList.slice(0, index);
        var b = this.siteList.slice(index + 1, this.siteList.length);
        this.siteList = a.concat(b);
    }
}

function Site(site) {
    this.name = site.name;
    this.url = site.url;
    this.unsel = site.unsel;
    this.pwsel = site.pwsel;
    this.sbsel = site.sbsel;
}

Site.prototype.validate = function() {
    if (this.url && this.unsel && this.pwsel && this.sbsel) {
        return true;
    }
    return false;
}

Array.prototype.add = function(item) {
    for ( var i = 0; i < this.length; i++) {
        if (this[i] === item) {
            return this;
        }
    }
    this[this.length] = item;
    return this.sort();
}