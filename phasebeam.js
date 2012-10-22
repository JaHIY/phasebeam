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
                sinAbs = $M.abs(sin),
                cosAbs = $M.abs(cos),
                circles = this.items.circles,
                lines = this.items.lines,
                drawCircle = this.drawCircle,
                drawLine = this.drawLine,
                circlesLastTime = [],
                linesLastTime = [],
                drawAnimatedCircles = function(fWidth, fHeight) {
                var len = circles.length,
                    item, x, y, radius, speed, time, lastTime;
                while (len > 0) {
                    len -= 1;
                    item = circles[len];
                    time = +new Date();
                    lastTime = circlesLastTime[len] || time;
                    circlesLastTime[len] = time;
                    x = item.x;
                    y = item.y;
                    radius = item.radius;
                    speed = item.speed*(time-lastTime)/100;
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
                    drawCircle(x, y, radius, item.rgba, item.shadow, item.blur);
                }
            },
            drawAnimatedLines = function(fWidth, fHeight) {
                var len = lines.length,
                    item, x, y, width, speed, endX, endY, time, lastTime;
                while (len > 0) {
                    len -= 1;
                    item = lines[len];
                    time = +new Date();
                    lastTime = linesLastTime[len] || time;
                    linesLastTime[len] = time;
                    x = item.x;
                    y = item.y;
                    width = item.width;
                    speed = item.speed*(time-lastTime)/100;
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
                    endX = x+sin*width;
                    endY = y-cos*width;
                    drawLine(x, y, endX, endY, width, item.rgba, item.shadow, item.blur);
                }
            },
            clearCircles = function() {
                var len = circles.length,
                    item, x, y, radius;
                while (len > 0) {
                    len -= 1;
                    item = circles[len];
                    x = item.x;
                    y = item.y;
                    radius = item.radius;
                    $fctx.clearRect(x-radius*1.2-1, y-radius*1.2-1, radius*2.4+2, radius*2.4+2);
                }
            },
            clearLines = function() {
                var len = lines.length,
                    item, x, y, width, endX, endY, minX, minY;
                while (len > 0) {
                    len -= 1;
                    item = lines[len];
                    x = item.x;
                    y = item.y;
                    width = item.width;
                    endX = x+sin*width;
                    endY = y-cos*width;
                    minX = x < endX ? x : endX;
                    minY = y < endY ? y : endY;
                    $fctx.clearRect(minX-cosAbs*width*0.4, minY-sinAbs*width*0.4, $M.abs(x-endX)+cosAbs*width*0.4*2, $M.abs(y-endY)+sinAbs*width*0.4*2);
                }
            },
            start = function() {
                var fWidth = $foreground.width,
                    fHeight = $foreground.height;
                clearCircles();
                clearLines();
                drawAnimatedCircles(fWidth, fHeight);
                drawAnimatedLines(fWidth, fHeight);
                window.reqAnimeFrame(function(){
                    start();
                });
            };
            start();
        },
        'config': {
            'circle': {
                'amount': 10,
                'rgba': [157, 97, 207, 0.4],
                'shadow': [46, 30, 105, 0.9],
                'blur': 0.2
            },
            'line': {
                'amount': 10,
                'rgba': [255, 255, 255, 0.5],
                'shadow': [255, 255, 255, 0.8],
                'blur': 0.1
            },
            'speed': 0.3,
            'angle': 20
        },
        'setCanvasSize': function() {
            var w = window,
                wWidth = w.innerWidth,
                wHeight = w.innerHeight;
            $foreground.width = wWidth;
            $foreground.height = wHeight;
            $background.width = wWidth;
            $background.height = wHeight;
            return this;
        },
        'clearForegroundCanvas': function() {
            var fWidth = $foreground.width,
                fHeight = $foreground.height;
            $fctx.clearRect(0, 0, fWidth, fHeight);
            return this;
        },
        'drawCircle': function(x, y, radius, rgba, shadow, blur) {
            var gradient = $fctx.createRadialGradient(x, y, radius, x, y, 0);
            gradient.addColorStop(0, 'rgba('+rgba.join(',')+')');
            gradient.addColorStop(1, 'rgba('+rgba.slice(0, 3).join(',')+','+(rgba[3]-0.1)+')');
            $fctx.beginPath();
            $fctx.arc(x, y, radius, 0, $M.PI*2, false);
            $fctx.shadowBlur = radius*blur;
            $fctx.shadowColor = 'rgba('+shadow.join(',')+')';
            $fctx.fillStyle = gradient;
            $fctx.fill();
        },
        'drawLine': function(x, y, endX, endY, width, rgba, shadow, blur) {
            var gradient = $fctx.createLinearGradient(x, y, endX, endY);
            gradient.addColorStop(0, 'rgba('+rgba.join(',')+')');
            gradient.addColorStop(1, 'rgba('+rgba.slice(0, 3).join(',')+','+(rgba[3]-0.1)+')');
            $fctx.beginPath();
            $fctx.moveTo(x, y);
            $fctx.lineTo(endX, endY);
            $fctx.lineWidth = 3;
            $fctx.lineCap = 'round';
            $fctx.shadowBlur = width*blur;
            $fctx.shadowColor = 'rgba('+shadow.join(',')+')';
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
                cshadow_rgb = circle.shadow.slice(0, 3),
                cshadow_alpha = circle.shadow[3],
                line = config.line,
                j = line.amount,
                lrgb = line.rgba.slice(0, 3),
                lalpha = line.rgba[3],
                lshadow_rgb = line.shadow.slice(0, 3),
                lshadow_alpha = line.shadow[3],
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
                    'rgba': crgb.concat($M.random()*0.3+calpha*$M.random()*0.5),
                    'shadow': cshadow_rgb.concat($M.random()*0.5+cshadow_alpha*0.5),
                    'blur': $M.random()*blur*0.5,
                    'speed': speed*(0.8+i*0.5)
                });
            }
            while (j > 0) {
                j -= 1;
                this.items.lines.push({
                    'x': $M.random() * fWidth,
                    'y': $M.random() * fHeight,
                    'width': $M.random()*(20+j*5)+(20+j*5),
                    'rgba': lrgb.concat($M.random()*0.2+lalpha*$M.random()*0.6),
                    'shadow': cshadow_rgb.concat($M.random()*0.5+cshadow_alpha*0.5),
                    'blur': $M.random()*blur*0.5,
                    'speed': speed*(0.8+j*0.5)
                });
            }
            return this;
        },
        'items': {}
    }
};

window.reqAnimeFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };


var amazing = phasebeam(document.getElementById('phasebeam'));
window.addEventListener("load", function () {
    amazing.setCanvasSize().createItems().drawBackground().animate();
}, false);
window.addEventListener("resize", function () {
    amazing.setCanvasSize().drawBackground().clearForegroundCanvas();
    setTimeout(function() {
        amazing.createItems();
    }, 500)
}, false);
