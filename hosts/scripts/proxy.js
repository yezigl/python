var Proxy = function() {
	chrome.proxy.settings.onChange.addListener(this.updateProxy.bind(this));
	chrome.proxy.onProxyError.addListener(function(details) {
	    console.log(details);
	});

	this.readProxyState();
};

Proxy.ProxyType = {
	AUTO : 'auto_detect',
	PAC : 'pac_script',
	DIRECT : 'direct',
	FIXED : 'fixed_servers',
	SYSTEM : 'system'
};

Proxy.WindowType = {
	REGULAR : 1,
	INCOGNITO : 2
};

Proxy.LevelOfControl = {
	NOT_CONTROLLABLE : 'not_controllable',
	OTHER_EXTENSION : 'controlled_by_other_extension',
	AVAILABLE : 'controllable_by_this_extension',
	CONTROLLING : 'controlled_by_this_extension'
};

Proxy.prototype = {
	_config : {},

	_isAllowedIncognitoAccess : false,
	
	_pacUrl : "",
	
	_pacManual : "",

	readProxyState : function() {
		chrome.extension.isAllowedIncognitoAccess(this._handleIncognitoAccess.bind(this));
	},
	
	get proxy() {
		return this._config;
	},
	
	set proxy(data) {
		if (!data)
			return;
		
		if (this._config.levelOfControl === Proxy.LevelOfControl.NOT_CONTROLLABLE ||
				this._config.levelOfControl === Proxy.LevelOfControl.OTHER_EXTENSION) {
			return;
		}
		
		this._config.regular = data;
		chrome.proxy.settings.set({
			value: this._config.regular, 
			scope: 'regular'
		}, this._callbackForRegularSettings.bind(this));
		
		if (this._isAllowedIncognitoAccess) {
			this._config.incognito = data;
			chrome.proxy.settings.set({
				value : this.config_.incognito,
				scope : 'incognito_persistent'
			}, this._callbackForIncognitoSettings.bind(this));
		}
	},
	
	get pacUrl() {
		return this._pacUrl;
	},
	
	set pacUrl(url) {
		this._pacUrl = url;
	},
	
	get pacManual() {
		return this._pacManual;
	},
	
	set pacManual(data) {
		this._pacManual = data;
	},
	
	_handleIncognitoAccess : function(state) {
		this._isAllowedIncognitoAccess = state;
		
		chrome.proxy.settings.get({
			incognito : false
		}, this._handleRegularState.bind(this));
		
		if (this._isAllowedIncognitoAccess) {
			chrome.proxy.settings.get({
				incognito : true
			}, this._handleIncognitoState.bind(this));
		}
	},

	_handleRegularState : function(c) {
		this._config.regular = c.value;
		this._config.levelOfControl = c.levelOfControl;
	},

	_handleIncognitoState : function(c) {
		this._config.incognito = c.value;
		this._config.levelOfControl = c.levelOfControl;
	},

	_callbackForRegularSettings : function() {
		if (chrome.extension.lastError) {
			return;
		}
	},

	_callbackForIncognitoSettings : function() {
		if (chrome.extension.lastError) {
			return;
		}
	},

	generateProxyConfig : function(type) {
		var config = {};
		switch (type) {
		case Proxy.ProxyType.SYSTEM:
			config.mode = Proxy.ProxyType.SYSTEM;
			break;
		case Proxy.ProxyType.DIRECT:
			config.mode = Proxy.ProxyType.DIRECT;
			break;
		case Proxy.ProxyType.PAC:
			config.mode = Proxy.ProxyType.PAC;
			config.pacScript = this.generatePacScript();
			break;
		case Proxy.ProxyType.FIXED:
			config.mode = Proxy.ProxyType.FIXED;
			config.rules = this.generateFixedRules(false);
			break;
		}
		return config;
	},

	generatePacScript : function() {
		var pacScript = {};
		pacScript.mandatory = false;
		if (this.pacUrl) {
			pacScript.url = this.pacUrl;
		} else if (this.pacManual) {
			pacScript.data = this.pacManual;
		} else {
			var script = [];
			script.push("function regExpMatch(url, pattern) {");
			script.push("\ttry { return new RegExp(pattern).test(url); } catch(ex) { return false; }");
			script.push("}\n");
			script.push("function FindProxyForURL(url, host) {");
			
			var current = Settings.getCurrentProfile();
			var profiles = Settings.getProfiles();
			var profile = profiles.hosts[current];
			var hostsList = profile.host.split("\n");
			for ( var i = 0; i < hostsList.length; i++) {
			    var host = hostsList[i];
			    if (!host || host.search("#") >= 0) {
			        continue;
			    }
			    
			    var ipaddr = host.split(/\s+/g);
			    var ip = ipaddr[0];
			    var addr = ipaddr[1];
			    if (ip && addr) {
			        script.push("\tif (shExpMatch(host, '" + addr + "')) return 'PROXY " + ip + "';");
			    }
			}

			script.push("\treturn 'DIRECT';");
			script.push("}");
			
			pacScript.data = script.join("\n");
		}
		return pacScript;
	},

	generateFixedRules : function(isSingle) {

	},

	updateProxy : function(config) {
		if (config.levelOfControl !== Proxy.LevelOfControl.CONTROLLING) {
			Settings.setCurrentProfile("_system");
			Settings.setValue(LocalStorageKey.OTHER_PROXY, config);
			chrome.browserAction.setTitle({title : chrome.i18n.getMessage("name")});
		}
		this.readProxyState();
	}
};