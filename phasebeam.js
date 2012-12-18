"use strict";

var phasebeam = function(canvasParentNode) {
    var $canvas = canvasParentNode.getElementsByTagName('canvas'),
        $foreground = $canvas[1],
        $background = $canvas[0],
        $fctx = $foreground.getContext('2d'),
        $bctx = $background.getContext('2d'),
        $w = window,
        $M = $w.Math;
    return {
        'animate': function() {
            var degree = this.config.angle/360*$M.PI*2,
                sina = $M.sin(degree),
                cosa = $M.cos(degree),
                sinaAbs = $M.abs(sina),
                cosaAbs = $M.abs(cosa),
                circles = this.items.circles,
                lines = this.items.lines,
                drawCircle = this.drawCircle,
                drawLine = this.drawLine,
                circlesLastTime = [],
                linesLastTime = [],
                w = $w,
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
                            x += sina*speed;
                        }
                        if (y > fHeight + radius) {
                            y = -radius;
                        } else if (y < -radius) {
                            y = fHeight + radius;
                        } else {
                            y -= cosa*speed;
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
                        if (x > fWidth + width * sina) {
                            x = -width * sina;
                        } else if (x < -width * sina) {
                            x = fWidth + width * sina;
                        } else {
                            x += sina*speed;
                        }
                        if (y > fHeight + width * cosa) {
                            y = -width * cosa;
                        } else if (y < -width * cosa) {
                            y = fHeight + width * cosa;
                        } else {
                            y -= cosa*speed;
                        }
                        item.x = x;
                        item.y = y;
                        endX = x+sina*width;
                        endY = y-cosa*width;
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
                        endX = x+sina*width;
                        endY = y-cosa*width;
                        minX = x < endX ? x : endX;
                        minY = y < endY ? y : endY;
                        $fctx.clearRect(minX-cosaAbs*width*0.4, minY-sinaAbs*width*0.4, $M.abs(x-endX)+cosaAbs*width*0.4*2, $M.abs(y-endY)+sinaAbs*width*0.4*2);
                    }
                },
                start = function() {
                    var fWidth = $foreground.width,
                        fHeight = $foreground.height;
                    clearCircles();
                    clearLines();
                    drawAnimatedCircles(fWidth, fHeight);
                    drawAnimatedLines(fWidth, fHeight);
                    w.reqAnimeFrame(function(){
                        start();
                    });
                };
            start();
        },
        'config': {
            'circle': {
                'amount': 10,
                'rgba': [157, 97, 207, 0.3],
                'rgba_delta': 5,
                'shadow': [46, 30, 105, 0.9],
                'shadow_delta': 3,
                'blur': 0.2,
                'speed': 0.3,
            },
            'line': {
                'amount': 10,
                'rgba': [255, 255, 255, 0.5],
                'rgba_delta': 5,
                'shadow': [255, 255, 255, 0.8],
                'shadow_delta': 3,
                'blur': 0.1,
                'speed': 0.5,
            },
            'angle': 20
        },
        'setCanvasSize': function() {
            var w = $w,
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
            var degree = this.config.angle/360*$M.PI*2,
                sina = $M.sin(degree),
                cosa = $M.cos(degree),
                sinaAbs = $M.abs(sina),
                cosaAbs = $M.abs(cosa),
                config = this.config,
                circle = config.circle,
                i = circle.amount,
                circle_red = circle.rgba[0],
                circle_green = circle.rgba[1],
                circle_blue = circle.rgba[2],
                circle_alpha = circle.rgba[3],
                circle_rgba_delta = circle.rgba_delta,
                circle_shadow_red = circle.shadow[0],
                circle_shadow_green = circle.shadow[1],
                circle_shadow_blue = circle.shadow[2],
                circle_shadow_alpha = circle.shadow[3],
                circle_shadow_delta = circle.shadow_delta,
                circle_blur = circle.blur,
                circle_speed = circle.speed,
                line = config.line,
                j = line.amount,
                line_red = line.rgba[0],
                line_green = line.rgba[1],
                line_blue = line.rgba[2],
                line_alpha = line.rgba[3],
                line_rgba_delta = line.rgba_delta,
                line_shadow_red = line.shadow[0],
                line_shadow_green = line.shadow[1],
                line_shadow_blue = line.shadow[2],
                line_shadow_alpha = line.shadow[3],
                line_shadow_delta = line.shadow_delta,
                line_blur = line.blur,
                line_speed = line.speed,
                fWidth = $foreground.width,
                fHeight = $foreground.height,
                radius, width,
                delta_color = function(color, delta) {
                    var d = ~~ ($M.pow(-1, ($M.random()*2&1))*$M.random()*(delta+1)), //~~(num+0.5) is the same as Math.round(), but faster
                        color_delta = color + d;
                    if (color_delta < 0) {
                        return 0;
                    } else {
                        if (color_delta > 255) {
                            return 255;
                        } else {
                            return color_delta;
                        }
                    }
                };
            this.items.circles = [];
            this.items.lines = [];
            while (i > 0) {
                i -= 1;
                radius = $M.random()*(20+i*5)+(20+i*5);
                this.items.circles.push({
                    'x': $M.random()*(fWidth+radius*2),
                    'y': $M.random()*(fHeight+radius*2),
                    'radius': radius,
                    'rgba': [delta_color(circle_blue, circle_rgba_delta), delta_color(circle_green, circle_rgba_delta), delta_color(circle_blue, circle_rgba_delta), $M.random()*0.4+circle_alpha*$M.random()*0.6],
                    'shadow': [delta_color(circle_shadow_red, circle_shadow_delta), delta_color(circle_shadow_green, circle_shadow_delta), delta_color(circle_shadow_blue, circle_shadow_delta), $M.random()*0.5+circle_shadow_alpha*0.5],
                    'blur': $M.random()*circle_blur,
                    'speed': circle_speed*(0.8+i*0.5)
                });
            }
            while (j > 0) {
                j -= 1;
                width = $M.random()*(20+j*5)+(20+j*5);
                this.items.lines.push({
                    'x': $M.random()*(fWidth+width*cosaAbs),
                    'y': $M.random()*(fHeight+width*sinaAbs),
                    'width': width,
                    'rgba': [delta_color(line_red, line_rgba_delta), delta_color(line_green, line_rgba_delta), delta_color(line_blue, line_rgba_delta), $M.random()*0.4+line_alpha*$M.random()*0.6],
                    'shadow': [delta_color(line_shadow_red, line_shadow_delta), delta_color(line_shadow_green, line_shadow_delta), delta_color(line_shadow_blue, line_shadow_delta), $M.random()*0.5+line_shadow_alpha*0.5],
                    'blur': $M.random()*line_blur,
                    'speed': line_speed*(0.8+j*0.5)
                });
            }
            console.log(this.items.circles, this.items.lines);
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
