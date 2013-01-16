(function() {
    var cache = {};
    var trace = function(o) {
        if (window.console && window.console.log) {
            console.log(o);
        }
    };
    var set_cookie = function(dict, days) {
        var date = new Date();
        days = days || 30;
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
        for (var i in dict) {
            document.cookie = i + "=" + dict[i] + expires + "; path=/";
        }
    };
    var get_cookie = function(name) {
        var nameEQ = name + "=", c, ca = document.cookie.split(";");
        for (var i = 0; i < ca.length; i++) {
            c = ca[i];
            while (c.charAt(0) == " ") {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) == 0) {
                return c.substring(nameEQ.length, c.length).replace(/\"/g, "");
            }
        }
        return null;
    };
    window.ropen = window.open;
    window.set_cookie = set_cookie;
    window.get_cookie = get_cookie;
    window.trace = trace;
    window.extStatusHandler = function(o) {
        o = eval("(" + o + ")");
        var type = o.type, song = o.song, statTotal = $(".stat-total i"), statLiked = $(".stat-liked i"), statBanned = $(".stat-banned i"), 
        	playerEvents = {init: function(o) {
                trace("init");
                var t = setTimeout(function() {
                    clearTimeout(t);
                    if (FM && FM.showFMChannelList) {
                        FM.showFMChannelList(o.channel === "dj" ? o.pid : o.channel);
                    } else {
                        t = setTimeout(arguments.callee, 0);
                    }
                }, 0);
                rotatead.refreshAd(o.channel);
            },gotoplay: function(o) {
                rotatead.refreshAd(o.channel);
            },pause: function(o) {
            },start: function(o) {
                var url, chName, chType, songName;
                document.title = song.title + " - 豆瓣FM";
                if (o.channel === "dj") {
                    FM.setActiveState(o.pid);
                    url = globalConfig.pageHost + "/?cid=dj&pid=" + o.pid;
                    chName = channelSet["ch_" + channelSet["ch_" + o.pid].parentId].name;
                    songName = channelSet["ch_" + o.pid].name;
                    chType = "dj";
                } else {
                    chName = channelSet["ch_" + o.channel].name;
                    songName = song.title;
                    if (song.subtype !== "T") {
                        url = globalConfig.pageHost + "/?start=" + song.sid + "g" + song.ssid + "g" + o.channel + "&cid=" + o.channel;
                    } else {
                        url = globalConfig.pageHost + "/?daid=" + song.sid + "&cid=" + o.channel;
                    }
                }
                bgad.set_adTheme(bgad.ad_theme_check(o.channel));
                FM.setCurrentSongInfo(songName, o.channel === "10" ? song.albumtitle : song.artist, chName, url, song.picture, chType);
            },r: function(o) {
                if (statLiked.length) {
                    statLiked.text((statLiked.text() | 0) + 1);
                }
            },u: function(o) {
                if (statLiked.length) {
                    statLiked.text((statLiked.text() | 0) - 1);
                }
            },nl: function(o) {
                newUser.getData(o);
            },e: function(o) {
                if (o.channel === "dj" && o.program_end) {
                    FM.playNextProgram(o.pid);
                    return
                }
                if (statTotal.length) {
                    statTotal.text((statTotal.text() | 0) + 1);
                }
                recentSongs.push(song.sid + ":p");
                recentSongs = recentSongs.slice(-3);
                set_cookie({ra_r: recentSongs.join("|")});
            },b: function(o) {
                if (statBanned.length) {
                    statBanned.text((statBanned.text() | 0) + 1);
                }
            },s: function(o) {
                rotatead.refreshAd(o.channel);
            },fixchannel: function(o) {
                rotatead.refreshAd(o.channel);
            }};
        playerEvents[type](o);
    };
    window.DBR = {act: function(cmd, arg) {
            var radio = document.getElementById("radioplayer");
            if (radio !== undefined || radio.act !== undefined) {
                radio.act.apply(radio, arguments);
            }
        },radio_getlist: function(url) {
            var radio = document.getElementById("radioplayer");
            if (radio === undefined || radio.list_onload === undefined) {
                return 0;
            }
            $.ajax({url: url,type: "GET",dataType: "text",timeout: 10000,error: function(xhr, msg) {
                    var res = "";
                    try {
                        res = xhr.responseText;
                    } catch (e) {
                        res = e.toString();
                    }
                    msg += " js_fail ";
                    msg += res.slice(0, 80);
                    radio.list_onerror("js_load_fail");
                },success: function(r) {
                    radio.list_onload(r);
                }});
            return "ok";
        },rlog: function(log) {
            trace(log);
        },except_report: function(reason) {
            $.get("/j/except_report?kind=ra006&env=" + navigator.userAgent + "+&reason=" + reason);
        },show_login: function() {
            var s = document.createElement("script");
            s.setAttribute("type", "text/javascript");
            s.setAttribute("charset", "utf-8");
            s.setAttribute("src", globalConfig.doubanHost + "/service/account/check_with_js?return_to=" + globalConfig.pageHost + "/&sig=" + globalConfig.sig);
            document.getElementsByTagName("head")[0].appendChild(s);
        }};
    window.show_login = function() {
        $.fn.loginFormCheck = function() {
            $("input.pop_email").blur(function() {
                var reg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/, email = $.trim($(this).val());
                if (email !== "" && !reg.test(email)) {
                    $(this).siblings("span.error").show();
                }
            }).focus(function() {
                $("span.error").hide();
            });
            $("form.pop_win_login_form").submit(function() {
                if ($.trim($("input.pop_email").val()) === "") {
                    $("div.spec span.error").show();
                }
                if ($("span.error:visible").length) {
                    return false;
                }
            });
        };
        $("body").append($('<div class="overlay"></div>'));
        $("div.overlay").css({width: $(document).width() + 32,height: $(document).height(),display: "block"});
        $.get("/j/misc/login_form", function(r) {
            var dlg = dui.Dialog({width: 555,title: "登录",isHideTitle: true,iframe: 1,content: r}).open(), node = dlg.node;
            node.find(".hd h3").replaceWith(node.find(".bd h3"));
            node.find("h3 a, form a").attr("target", "_blank");
            node.find("form").loginFormCheck();
            node.find("a.dui-dialog-close").bind("click", function() {
                $("div.overlay").remove();
                return false;
            });
            dlg.update();
        });
        return false;
    };
})();
