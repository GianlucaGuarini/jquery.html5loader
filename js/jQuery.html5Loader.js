/**
 *
 * Version: 	0.2.0
 * Author:		Gianluca Guarini
 * Contact: 	gianluca.guarini@gmail.com
 * Website:		http://www.gianlucaguarini.com/
 * Twitter:		@gianlucaguarini
 *
 * Copyright (c) 2011 Gianluca Guarini
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 **/
(function ($) {

    $.fn.extend({
        html5Loader: function (options) {
            var container = this;
            var defaults = {
                preloaderType: 'circular',
                currPercentage: 0,
                getFilesToLoadJSON: null,
                positionX: container.width() / 2,
                positionY: container.height() / 2,
                lineWidth: 5,
                color: "#ffffff",
                font: "normal 11px Arial",
                preloadPage: true,
                fullScreen: true,
                onComplete: function () {},
                onItemLoaded: function (obj) {},
                pathToFallbackGif: 'preloaderFallback.gif',
                radius: 40,
                debugMode: true,
                glowColor: null
            };
            var options = $.extend(defaults, options);
            //@public vars
            var preloaderType      = options.preloaderType;
            var currPercentage     = options.currPercentage;
            var positionX          = options.positionX;
            var positionY          = options.positionY;
            var lineWidth          = options.lineWidth;
            var color              = options.color;
            var font               = options.font;
            var getFilesToLoadJSON = options.getFilesToLoadJSON;

            var glowColor          = options.glowColor;
            var onComplete         = options.onComplete;
            var onItemLoaded       = options.onItemLoaded;
            var pathToFallbackGif  = options.pathToFallbackGif;
            var radius             = options.radius;
            var preloadPage        = options.preloadPage;
            var fullScreen         = options.fullScreen;
            var debugMode          = options.debugMode;

            //@private var
            var canvas = null;
            var _CircularPreloader = {
                startAngle: 1.5 * Math.PI,
                endAngle: 0
            }
            var _allFilesWeightLoaded = false;
            var _media;
            var _lastMediaID = 0;
            var _mediaID = 0;
            var CanvasID = 0;
            var _lastPercentage = 0;
            var _bytesTotal = 0;
            var _bytesLoaded = 0;
            var _elementsArray = [];
            var _sizeArray = [];
            var _sourceArray = [];
            var _typeArray = [];
            var getFileSize = function filesize(url, readyToLoad) {

                    var req = new XMLHttpRequest();

                    if (!req) {
                        throw new Error('XMLHttpRequest not supported');

                        return 0;
                    }

                    req.open('HEAD', url, false);

                    req.send(null);

                    if (!req.getResponseHeader) {

                        try {
                            debugMode == true ? console.log('No getResponseHeader!') : '';
                            throw new Error('No getResponseHeader!');
                        } catch (e) {
                            return 0;
                        }
                    } else if (!req.getResponseHeader('Content-Length')) {
                        try {
                            debugMode == true ? console.log('No Content-Length!') : '';
                            throw new Error('No Content-Length!');
                            return 0;
                        } catch (e2) {
                            debugMode == true ? console.log('I can\'t get the file size! You can use this feature loading files on a server from the same domain in wich page is loaded.') : '';
                            return 0;
                        }
                    } else {
                        debugMode == true ? console.log('I can get the file size!') : '';
                        if (readyToLoad == true) {
                            _allFilesWeightLoaded = true;

                        }
                        return req.getResponseHeader('Content-Length');

                    }

                }

            function preloadPageFunc() {
                debugMode == true ? console.log('Start preload Page') : '';
                var ElementsArr = $('img');
                currPercentage = 0;
                if (options.preloaderType == 'line' && Modernizr.canvas) {
                    debugMode == true ? console.log('drawning line preloader') : '';
                    drawLinePreloader(currPercentage);
                }
                if (options.preloaderType == 'circular' && Modernizr.canvas) {
                    debugMode == true ? console.log('drawning circular preloader') : '';
                    draw_CircularPreloader(currPercentage);
                }

                $('img').each(function (index, ele) {
                    var type = null;

                    if ($(ele).is('img') == true) {
                        type = 'IMAGE';
                    }
                    if ($(ele)[0].tagName === 'VIDEO') {
                        type = 'VIDEO';
                    }

                    if ($(ele)[0].tagName === 'AUDIO') {
                        type = 'AUDIO';
                    }
                    if ($(ele).is('script') == true) {
                        type = 'SCRIPT';
                    }


                    var source = $(ele).prop('src');

                    var is_last_item = (index == (ElementsArr.length - 1));


                    var size = getFileSize(source, is_last_item);


                    feelFilesArray(ele, size, source, type);
                    if (is_last_item == true) {

                        var _allRightTimer = setTimeout(function () {
                            if (_allFilesWeightLoaded == true) {
                                startLoadElements();
                                console.log('timeout');
                                this.clearTimeout();
                            }
                        }, 1);

                    }
                });

            }

            function feelFilesArray(currEle, currSize, currSource, currType) {



                _bytesTotal = _bytesTotal + parseInt(currSize);

                debugMode == true ? console.log('Getting file:' + currSource + ' Size: ' + currSize) : '';

                _elementsArray.push(currEle);
                _sizeArray.push(currSize);
                _sourceArray.push(currSource);
                _typeArray.push(currType);




            }
            this.init = function (options) {

                debugMode == true ? console.log('Start application!') : '';
                if (getFilesToLoadJSON) {
                    $.getJSON(getFilesToLoadJSON, function (data) {
                        var ElementsArr = data.files;

                        $.each(data.files, function (key, val) {

                            var _elm = $('img').attr('src', val.source) ? $('img').attr('src', val.source) : '';

                            feelFilesArray(_elm, val.size, val.source, val.type)
                            var is_last_item = (key == (ElementsArr.length - 1));

                            if (is_last_item == true) {
                                startLoadElements();
                            }
                        });
                    })
                }
                if (Modernizr.canvas && (preloadPage == true || getFilesToLoadJSON != null)) {

                    if (fullScreen == true) {
                        debugMode == true ? console.log('Setting Full screen') : '';
                        container.css({
                            position: 'fixed',
                            height: $(window).height(),
                            width: $(window).width(),
                            'z-index': 98,
                            top: 0
                        })
                        positionX = container.width() / 2;
                        positionY = container.height() / 2;
                        $(container).html('<canvas id="html5Canvas' + CanvasID + '" width="' + $(container).width() + 'px "height="' + $(container).height() + 'px"></canvas>');
                        canvas = document.getElementById('html5Canvas' + CanvasID);
                        CanvasID++;


                        //create background
                        $(canvas).css({
                            position: 'fixed',
                            top: ($(window).height() / 2) - ($(canvas).height() / 2),
                            left: ($(window).width() / 2) - ($(canvas).width() / 2),
                            'z-index': 99
                        })

                        $(window).bind('resize.CenterCanvas', function () {
                            $(canvas).css({
                                top: ($(window).height() / 2) - ($(canvas).height() / 2),
                                left: ($(window).width() / 2) - ($(canvas).width() / 2)

                            })
                            container.css({
                                position: 'fixed',
                                height: $(window).height(),
                                width: $(window).width(),
                                'z-index': 98
                            })

                        })
                    } else {
                        $(container).html('<canvas id="html5Canvas' + CanvasID + '" width="' + $(container).width() + 'px "height="' + $(container).height() + 'px"></canvas>');
                        canvas = document.getElementById('html5Canvas' + CanvasID);
                        CanvasID++;
                    }
                    if (preloadPage == true && getFilesToLoadJSON == null) {

                        preloadPageFunc();

                    }
                    if (getFilesToLoadJSON) {
                        if (options.preloaderType == 'line' && Modernizr.canvas) {
                            drawLinePreloader(currPercentage);
                        }
                        if (options.preloaderType == 'circular' && Modernizr.canvas) {
                            draw_CircularPreloader(currPercentage);
                        }



                    }

                } else {

                    debugMode == true ? console.log('Fallback') : '';
                    if (preloadPage == true && getFilesToLoadJSON == null) {

                        preloadPageFunc();

                    }
                    if (fullScreen == true) {

                        var fallbackCanvas = container.append('<img src="' + pathToFallbackGif + '" alt="loading page..." /> ');
                        var fallbackImg = container.find('img').attr('src', pathToFallbackGif);

                        fallbackImg.css({
                            position: 'fixed',
                            top: ($(window).height() / 2) - (fallbackImg.height() / 2),
                            left: ($(window).width() / 2) - (fallbackImg.width() / 2),
                            'z-index': 99
                        });

                        container.css({
                            position: 'fixed',
                            height: $(window).height(),
                            width: $(window).width(),
                            'z-index': 98
                        })
                        $(window).bind('resize.CenterCanvas', function () {
                            var fallbackImg = container.find('img').attr('src', pathToFallbackGif);
                            fallbackImg.css({
                                top: ($(window).height() / 2) - (fallbackImg.height() / 2),
                                left: ($(window).width() / 2) - (fallbackImg.width() / 2)

                            })

                            container.css({
                                position: 'fixed',
                                height: $(window).height(),
                                width: $(window).width()

                            })
                        });

                    } else {
                        var fallbackCanvas = container.append('<img src="' + pathToFallbackGif + '" alt="loading page..." /> ');

                        fallbackCanvas.css({
                            float: 'left',
                            marginLeft: positionX,
                            marginTop: positionY

                        });
                    }

                    $(window).ready(function () {
                        fallbackCanvas.delay(1000).fadeOut(function () {
                            if (onComplete != null) {
                                var _onComplete = new onComplete;
                            }
                            $(this).remove();
                        });
                    });
                }
            }

            function startLoadElements() {

                $(_elementsArray).each(function (index, element) {

                    if (_typeArray[index] == 'IMAGE') {
                        $(window).load(_sourceArray[index], function () {
                            if ($(_elementsArray[index])) {
                                var _onItemLoaded = new onItemLoaded(_sourceArray[index]);

                            }
                            _bytesLoaded = _bytesLoaded + parseInt(_sizeArray[index]);
                            updatePercentage(_bytesLoaded);
                        })
                    }

                    debugMode == true ? console.log('Loading file:' + _sourceArray[index]) : '';

                });
            }

            function updatePercentage(_bytesLoaded) {

                currPercentage = Math.round((_bytesLoaded / _bytesTotal) * 100);
                debugMode == true ? console.log('Percentage: ' + parseInt(currPercentage) + '%') : '';

                if (options.preloaderType == 'line' && Modernizr.canvas) {
                    drawLinePreloader(currPercentage);
                }
                if ((options.preloaderType == 'circular' && Modernizr.canvas)) {
                    draw_CircularPreloader(currPercentage);
                }


            }

            function drawLinePreloader(to) {
                debugMode == true ? console.log('Drawning line') : '';
                $({
                    perc: _lastPercentage
                }).animate({
                    perc: to
                }, {
                    duration: 1000,
                    step: function () {

                        var context = canvas.getContext('2d');
                        // calculating percentage to load
                        var alphaPercentage = (container.width() / 100) * this.perc;
                        //clearing canvas from everithing
                        context.clearRect(0, 0, container.width(), container.height());
                        //let's start drawning
                        context.beginPath();
                        //draw percentage text
                        context.font = font;
                        context.fillStyle = color;
                        context.fillText(Math.round(this.perc) + "%", positionX - 8, positionY - 15);
                        //width of the preloader line
                        context.lineWidth = lineWidth;
						//color of preloader line
                        if (glowColor != null) {
                            context.shadowOffsetX = 0;
                            context.shadowOffsetY = 0;
                            context.shadowBlur = 10;
                            context.shadowColor = glowColor;
                        }
                        //color of preloader line
                        context.strokeStyle = color;
                        context.moveTo(0, positionY)
                        context.lineTo(alphaPercentage, positionY)
                        context.stroke();

                        context.save();
                    },
                    complete: function () {
                        _lastPercentage = Math.round(to);
                        if (_lastPercentage >= 100) {
                            if (onComplete != null) {
                                var _onComplete = new onComplete;
                            }

                            //remove canvas from the stage
                            container.delay(1000).fadeOut(function () {
                                $(window).unbind('CenterCanvas');
                                $(this).remove()
                            });
                        }


                    }

                })

            }

            function draw_CircularPreloader(to) {
                debugMode == true ? console.log('Drawning circle') : '';
                $({
                    perc: _lastPercentage
                }).animate({
                    perc: to
                }, {
                    duration: 1000,
                    step: function () {

                        var context = canvas.getContext('2d');
                        // calculating percentage to load
                        var alphaPercentage = (2 / 100) * this.perc;

                        // calculating end angle of preloader
                        _CircularPreloader.endAngle = (alphaPercentage * Math.PI) + _CircularPreloader.startAngle;

                        //clearing canvas from everithing
                        context.clearRect(0, 0, container.width(), container.height());
                        //let's start drawning
                        context.beginPath();
                        //draw percentage text
                        context.font = font;
                        context.fillStyle = color;
                        context.fillText(Math.round(this.perc) + "%", positionX - 10, positionY + 3);

                        //width of the preloader line
                        context.lineWidth = lineWidth;
                        //color of preloader line
                        if (glowColor != null) {
                            context.shadowOffsetX = 0;
                            context.shadowOffsetY = 0;
                            context.shadowBlur = 10;
                            context.shadowColor = glowColor;
                        }
                        context.strokeStyle = color;
                        context.arc(positionX, positionY, radius, _CircularPreloader.startAngle, _CircularPreloader.endAngle, false);

                        context.stroke();

                        context.save();
                    },
                    complete: function () {
                        _lastPercentage = Math.round(to);

                        if (_lastPercentage >= 100) {
                            if (onComplete != null) {
                                debugMode == true ? console.log('Loading Complete') : '';
                                var _onComplete = new onComplete;
                            }

                            //remove canvas from the stage
                            container.delay(1000).fadeOut(function () {
                                $(window).unbind('CenterCanvas');
                                $(this).remove()
                            });
                        }


                    }

                })

            }
            return this.init(options);
        }

    });

})(jQuery);