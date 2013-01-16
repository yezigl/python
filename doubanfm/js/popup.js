$(function() {
    function initPlayer() {
        var bgpage = chrome.extension.getBackgroundPage();
        window.Player = bgpage.Player;
        window.trace = bgpage.trace;
    }

    var Controls = {
        playWidth : 20,
        playHeight : 20,
        nextWidth : 16,
        nextHeight : 16,
        lineWidth : 6,
        color : "rgba(10, 10, 10, 0.6)",
        playhGap : 4,
        playvGap : 1,
        volMax : 1
    }

    var Controller = {
        play : "",
        next : "",
        forward : "",
        count : 0,
        id : 0,
        drag : false,
        init : function() {
            if (!Player) {
                initPlayer();
            }
            if (Player.isPlay()) {
                this.countdown();
            }
            
            var canvas1 = $("#playsong").append("<canvas></canvas>").find("canvas").attr({
                width : Controls.playWidth,
                height : Controls.playHeight,
                status : Player.isPlay() ? "play" : "pause"
            });
            var canvas2 = $("#nextsong").append("<canvas></canvas>").find("canvas").attr({
                width : Controls.nextWidth * 2,
                height : Controls.nextHeight
            });
            var canvas3 = $("#nextlist").append("<canvas></canvas>").find("canvas").attr({
                width : Controls.nextWidth * 3,
                height : Controls.nextHeight
            });
            this.play = canvas1[0].getContext('2d');
            this.next = canvas2[0].getContext('2d');
            this.forward = canvas3[0].getContext('2d');

            canvas1.click(function() {
                if ($(this).attr("status") == "pause") {
                    Controller.drawPause();
                    Player.resume();
                    //Controller.countdown();
                    $(this).attr("status", "play");
                } else if ($(this).attr("status") == "play") {
                    Controller.drawPlay();
                    Player.pause();
                    Controller.clear();
                    $(this).attr("status", "pause");
                }
            });
            canvas2.click(function() {
                Player.next();
            });
            canvas3.click(function() {
                Player.loadplaylist();
            });
            
            $("#song-progress").append("<i id='vol-value'></i>").find("#vol-value").addClass("vv").hide();
            var p = $("#volume").position();
            $("#vol-value").css({top: p.top + 18, left: p.left + 3});
            $("#volume").mouseover(function() {
                $("#vol-value").show();
            }).mouseout(function() {
                //$("#vol-value").hide();
            }).click(function() {
                Controller.volume(0);
            });
            $("#vol-value").click(function() {
                var h = event.offsetY;
                Controller.volume(h);
            }).mousedown(function() {
               Controller.drag = true;
            }).mouseup(function() {
                Controller.drag = false;
            }).mousemove(function() {
                if (Controller.drag) {
                    var h = event.offsetY;
                    Controller.volume(h);
                }
            });
            
        },
        drawPlay : function() {
            this.check();
            this.play.clearRect(0, 0, Controls.playWidth, Controls.playHeight);
            this.play.fillStyle = Controls.color;

            this.play.beginPath();
            this.play.moveTo(Controls.playWidth, Controls.playHeight / 2);
            this.play.lineTo(0, 0);
            this.play.lineTo(0, Controls.playHeight);
            this.play.fill();
        },
        drawPause : function() {
            this.check();
            var left = Controls.playWidth / 2 - Controls.lineWidth;
            var right = Controls.playWidth / 2 + Controls.playhGap;

            this.play.clearRect(0, 0, Controls.playWidth, Controls.playHeight);
            this.play.lineWidth = Controls.lineWidth;
            this.play.strokeStyle = Controls.color;

            this.play.beginPath();
            this.play.moveTo(left, Controls.playvGap);
            this.play.lineTo(left, Controls.playHeight - Controls.playvGap);
            this.play.stroke();

            this.play.beginPath();
            this.play.moveTo(right, Controls.playvGap);
            this.play.lineTo(right, Controls.playHeight - Controls.playvGap);
            this.play.stroke();
        },
        drawNext : function() {
            this.check();
            this.next.clearRect(0, 0, Controls.nextWidth * 2, Controls.nextHeight);
            this.next.fillStyle = Controls.color;

            this.next.beginPath();
            this.next.moveTo(Controls.nextWidth, Controls.nextHeight / 2);
            this.next.lineTo(0, 0);
            this.next.lineTo(0, Controls.nextHeight);
            this.next.fill();

            this.next.beginPath();
            this.next.moveTo(Controls.nextWidth * 2, Controls.nextHeight / 2);
            this.next.lineTo(Controls.nextWidth, 0);
            this.next.lineTo(Controls.nextWidth, Controls.nextHeight);
            this.next.fill();
        },
        drawForward : function() {
            this.check();
            this.forward.clearRect(0, 0, Controls.nextWidth * 3, Controls.nextHeight);
            this.forward.fillStyle = Controls.color;

            this.forward.beginPath();
            this.forward.moveTo(Controls.nextWidth, Controls.nextHeight / 2);
            this.forward.lineTo(0, 0);
            this.forward.lineTo(0, Controls.nextHeight);
            this.forward.fill();

            this.forward.beginPath();
            this.forward.moveTo(Controls.nextWidth * 2, Controls.nextHeight / 2);
            this.forward.lineTo(Controls.nextWidth, 0);
            this.forward.lineTo(Controls.nextWidth, Controls.nextHeight);
            this.forward.fill();

            this.forward.lineWidth = Controls.lineWidth;
            this.forward.strokeStyle = Controls.color;

            this.forward.beginPath();
            this.forward.moveTo(Controls.nextWidth * 2 + Controls.lineWidth / 2, Controls.playvGap);
            this.forward.lineTo(Controls.nextWidth * 2 + Controls.lineWidth / 2, Controls.nextHeight - Controls.playvGap);
            this.forward.stroke();
        },
        check : function() {
            if (!$("#playsong").find("canvas")) {
                this.init();
            }
        },
        draw : function(isPlay) {
            if (isPlay) {
                this.drawPause();
            } else {
                this.drawPlay();
            }
            this.drawNext();
            this.drawForward();
        },
        format : function(length) {
            var time = length;
            var min = Math.floor(time / 60);
            var sec = time % 60;
            return min + ":" + (sec > 9 ? sec : ("0" + sec));
        },
        countdown : function() {
            if (Controller.count == 0) {
                Controller.count = Player.song.length - Math.floor(Player.audio.currentTime);
            }
            if (Controller.count >= 0) {
                $("#time").text(Controller.format(Controller.count--));
                Controller.id = setTimeout(Controller.countdown, 1000);
            }
        },
        clear : function() {
            clearTimeout(this.id);
        },
        volume : function(h) {
            var vol = Controls.volMax / $("#vol-value").height() * h;
            Player.volume(vol);
        }
    };
    
    var Progress = {
        init : function() {
            if (!Player) {
                initPlayer();
            }
            var length = Player.audio.duration ? Player.audio.duration : Player.song.length;
            if (Player.isPlay()) {
                $("#progress2").css("width", Player.audio.currentTime / length * 150);
                $("#progress2").animate({width : "150px"}, (length - Player.audio.currentTime) * 1000);
            } else {
                $("#progress2").css("width", 0);
            }
        },
        start : function() {
            if (Player.isPlay()) {
                $("#progress2").animate({width : "150px"}, Player.song.length * 1000);
            }
        },
        stop : function() {
            $("#progress2").stop();
        },
        reset : function() {
            $("#progress2").css("width", 0);
        }
    }
    
    var SongInfo = {
        init : function() {
            if (!Player) {
                initPlayer();
            }
            if (Player.song.picture) {
                $("#cover").attr("src", Player.song.picture);
                $("#artist").text(Player.song.artist);
                $("#album").text(Player.song.albumtitle + " - " + Player.song.public_time);
                $("#title").text(Player.song.title);
                $("#time").text(Controller.format(Player.song.length - Math.floor(Player.audio.currentTime)));
            }
        }
    }
    
    initPlayer();
    window.Controller = Controller;
    window.Progress = Progress;
    window.SongInfo = SongInfo;
});