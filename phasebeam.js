"use strict";

var phasebeam = function(canvasParentNode) {
    var $canvas = canvasParentNode.getElementsByTagName('canvas'),
        $foreground = $canvas[1],
        $background = $canvas[0],
        $fctx = $foreground.getContext('2d'),
        $bctx = $background.getContext('2d'),
        $M = window.Math;
    return {
        'animate': function() {
            var degree = this.config.angle/360*$M.PI*2,
                sin = $M.sin(degree),
                cos = $M.cos(degree),
                fWidth = $foreground.width,
                fHeight = $foreground.height,
                circles = this.items.circles,
                lines = this.items.lines,
                len = circles.length,
                that = this,
                item, x, y,radius, speed, width, endX, endY;
            $fctx.clearRect(0, 0, fWidth, fHeight);
            while (len > 0) {
                len -= 1;
                item = circles[len];
                x = item.x;
                y = item.y;
                radius = item.radius;
                speed = item.speed;
                //$fctx.clearRect(x-radius-1, y-radius-1, radius*2+2, radius*2+2);
                //$fctx.fillStyle="#FFFFFF";
                //$fctx.fillRect(x-radius-1, y-radius-1, radius*2+2, radius*2+2);
                if (x > fWidth + radius) {
                    x = -radius;
                } else if (x < -radius) {
                    x = fWidth + radius;
                } else {
                    x += sin*speed;
                }
                if (y > fHeight + radius) {
                    y = -radius;
                } else if (y < -radius) {
                    y = fHeight + radius;
                } else {
                    y -= cos*speed;
                }
                item.x = x;
                item.y = y;
                this.drawCircle(x, y, radius, item.rgba);
            }
            len = lines.length;
            while (len > 0) {
                len -= 1;
                item = lines[len];
                x = item.x;
                y = item.y;
                width = item.width;
                speed = item.speed;
                endX = x+$M.sin(degree)*width;
                endY = y-$M.cos(degree)*width;
                //$fctx.clearRect(x, y, $M.abs(endX-x), $M.abs(endY-y));
                if (x > fWidth + width * sin) {
                    x = -width * sin;
                } else if (x < -width * sin) {
                    x = fWidth + width * sin;
                } else {
                    x += sin*speed;
                }
                if (y > fHeight + width * cos) {
                    y = -width * cos;
                } else if (y < -width * cos) {
                    y = fHeight + width * cos;
                } else {
                    y -= cos*speed;
                }
                item.x = x;
                item.y = y;
                this.drawLine(x, y, endX, endY, item.rgba);
            }
            window.reqAnimeFrame(function(){
                that.animate();
            });
        },
        'config': {
            'circle': {
                'amount': 10,
                'rgba': [157, 97, 207, 0.3]
            },
            'line': {
                'amount': 10,
                'rgba': [255, 255, 255, 0.5]
            },
            'speed': 0.1,
            'angle': 20
        },
        'setCanvasSize': function() {
            var wWidth = window.innerWidth,
                wHeight = window.innerHeight;
            $foreground.width = wWidth;
            $foreground.height = wHeight;
            $background.width = wWidth;
            $background.height = wHeight;
            return this;
        },
        'drawCircle': function(x, y, radius, rgba) {
            var gradient = $fctx.createRadialGradient(x, y, radius, x, y, 0);
            gradient.addColorStop(0, 'rgba('+rgba[0]+','+rgba[1]+','+rgba[2]+','+rgba[3]+')');
            gradient.addColorStop(1, 'rgba('+rgba[0]+','+rgba[1]+','+rgba[2]+','+(rgba[3]-0.1)+')');
            $fctx.beginPath();
            $fctx.arc(x, y, radius, 0, $M.PI*2, false);
            $fctx.shadowBlur = radius*0.2;
            $fctx.shadowColor = "rgba(46, 30, 105, 0.9)";
            $fctx.fillStyle = gradient;
            $fctx.fill();
        },
        'drawLine': function(x, y, endX, endY, rgba) {
            var gradient = $fctx.createLinearGradient(x, y, endX, endY);
            gradient.addColorStop(0, 'rgba('+rgba[0]+','+rgba[1]+','+rgba[2]+','+rgba[3]+')');
            gradient.addColorStop(1, 'rgba('+rgba[0]+','+rgba[1]+','+rgba[2]+','+(rgba[3]-0.1)+')');
            $fctx.beginPath();
            $fctx.moveTo(x, y);
            $fctx.lineTo(endX, endY);
            $fctx.lineWidth = 3;
            $fctx.lineCap = 'round';
            $fctx.shadowBlur = 5;
            $fctx.shadowColor = "rgba(255, 255, 255, 0.8)";
            $fctx.strokeStyle = gradient;
            $fctx.stroke();
        },
        'drawBackground': function() {
            var bWidth = $background.width,
                bHeight = $background.height,
                gradient;
            $bctx.clearRect(0, 0, bWidth, bHeight);
            $bctx.fillStyle = '#000000';
            $bctx.fillRect(0, 0, bWidth, bHeight);
            gradient = $bctx.createRadialGradient(bWidth*0.3, bHeight*0.1, 0, bWidth*0.3, bHeight*0.1, bWidth*0.9);
            gradient.addColorStop(0, 'rgb(0, 26, 77)');
            gradient.addColorStop(1, 'transparent');
            $bctx.translate(bWidth, 0);
            $bctx.scale(-1,1);
            $bctx.fillStyle = gradient;
            $bctx.fillRect(0, 0, bWidth, bHeight);
            gradient = $bctx.createRadialGradient(bWidth*0.1, bHeight*0.1, 0, bWidth*0.3, bHeight*0.1, bWidth);
            gradient.addColorStop(0, 'rgb(0, 150, 240)');
            gradient.addColorStop(0.8, 'transparent');
            $bctx.translate(bWidth, 0);
            $bctx.scale(-1,1);
            $bctx.fillStyle = gradient;
            $bctx.fillRect(0, 0, bWidth, bHeight);
            gradient = $bctx.createRadialGradient(bWidth*0.1, bHeight*0.5, 0, bWidth*0.1, bHeight*0.5, bWidth*0.5);
            gradient.addColorStop(0, 'rgb(40, 20, 105)');
            gradient.addColorStop(1, 'transparent');
            $bctx.fillStyle = gradient;
            $bctx.fillRect(0, 0, bWidth, bHeight);
            return this;
        },
        'createItems': function() {
            var config = this.config,
                circle = config.circle,
                i = circle.amount,
                crgb = circle.rgba.slice(0, 3),
                calpha = circle.rgba[3],
                line = config.line,
                j = line.amount,
                lrgb = line.rgba.slice(0, 3),
                lalpha = line.rgba[3],
                speed = config.speed,
                fWidth = $foreground.width,
                fHeight = $foreground.height;
            this.items.circles = [];
            this.items.lines = [];
            while (i > 0) {
                i -= 1;
                this.items.circles.push({
                    'x': $M.random() * fWidth,
                    'y': $M.random() * fHeight,
                    'radius': $M.random()*(20+i*5)+(20+i*5),
                    'rgba': crgb.concat($M.random()*0.2+calpha*($M.random()+0.5)),
                    'speed': speed*(0.2+i*0.5)
                });
            }
            while (j > 0) {
                j -= 1;
                this.items.lines.push({
                    'x': $M.random() * fWidth,
                    'y': $M.random() * fHeight,
                    'width': $M.random()*(20+j*5)+(20+j*5),
                    'rgba': lrgb.concat($M.random()*0.2+lalpha*($M.random()+0.3)),
                    'speed': speed*(0.2+j*0.5)
                });
            }
            return this;
        },
        'items': {}
    }
}

window.reqAnimeFrame = (function(callback) {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();


var amazing = phasebeam(document.getElementById('phasebeam'));
window.addEventListener("load", function () {
    amazing.setCanvasSize().drawBackground().createItems().animate();
}, false);
window.addEventListener("resize", function () {
    amazing.setCanvasSize().drawBackground();
    setTimeout(function() {
        amazing.createItems();
    }, 500)
}, false);
