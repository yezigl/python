var extension = chrome.extension.getBackgroundPage();

var LocalStorage = {
	getRules : function() {
		var val = extension.localStorage[LocalStorageKey.RULES];
		return val ? JSON.parse(val) : Rules;
	},
	getProfiles : function() {
		var val = extension.localStorage[LocalStorageKey.PROFILES];
		return val ? JSON.parse(val) : Profiles;
	},
	setRules : function(val) {
		extension.localStorage[LocalStorageKey.RULES] = JSON.stringify(val);
	},
	setProfiles : function(val) {
	    extension.localStorage[LocalStorageKey.PROFILES] = JSON.stringify(val);
	},
	getCurrentProfile : function() {
		return this.getValue(LocalStorageKey.PROXY);
	},
	setCurrentProfile : function(val) {
		this.setValue(LocalStorageKey.PROXY, val);
	},
	getValue : function(key) {
		return extension.localStorage[key];
	},
	setValue : function(key, val) {
		extension.localStorage[key] = val;
	},
	getDisplay : function() {
	    return this.getValue(LocalStorageKey.PH_DISPLAY) || "proxy";
	},
	setDisplay : function(val) {
	    this.setValue(LocalStorageKey.PH_DISPLAY, val);
	}
};

var Settings = LocalStorage;

var Tabs = {
	PROFILE : "profile",
	CONFIG : "config",
	OPTION : "option"
};

var Rules = {
	list : [],
	domain : {}
};

var Profiles = {
	list : [],
	rules : {},
	hosts : {}
};

var LocalStorageKey = {
	RULES : "rules",
	PROFILES : "profiles",
	PROXY : "proxy_profile",
	OTHER_PROXY : "other_proxy",
	PH_DISPLAY : "profile_hosts_display"
};

Array.prototype.add = function(item) {
	for ( var i = 0; i < this.length; i++) {
		if (this[i] === item) {
			return this;
		}
	}
	this[this.length] = item;
	return this.sort();
}

Array.prototype.indexOf = function(item) {
	for ( var i = 0; i < this.length; i++) {
		if (this[i] === item) {
			return i;
		}
	}
	return -1;
}

Array.prototype.compare = function(newa) {
	for ( var i = 0; i < this.length; i++) {
		if (newa.indexOf(this[i]) < 0) {
			return this[i];
		}
	}
}

Array.prototype.remove = function(item) {
    var index = this.indexOf(item);
    var re = this[index];
    if (index >= 0) {
        var a = this.slice(0, index);
        var b = this.slice(index + 1, this.length);
        this = a.concat(b);
    }
    return re;
}