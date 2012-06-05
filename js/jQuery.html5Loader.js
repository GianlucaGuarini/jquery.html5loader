/**
 *
 * Version:     1.3
 * Author:      Gianluca Guarini
 * Contact:     gianluca.guarini@gmail.com
 * Website:     http://www.gianlucaguarini.com/
 * Twitter:     @gianlucaguarini
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
    'use strict';
    $.fn.extend({
        html5Loader: function (options) {
            var container =         this;
            var defaults = {
                preloaderType:      'circular',                 /* set the type of preload you need */
                currPercentage:     0,                          /* set the starting percentage */
                getFilesToLoadJSON: null,                       /* set the path of JSON */
                positionX:          container.width() / 2,      /* set x position of the preloader on the canvas */
                positionY:          container.height() / 2,     /* set y position of the preloader on the canvas */
                lineWidth:          5,                          /* set preloader's line width */
                color:              "#ffffff",                  /* set preloader color */
                font:               "normal 11px Arial",        /* set preloader font (you can embed a font by css and use it here) */
                fullScreen:         true,                       /* chose if you want to overlay the page or just use the preloader in a box */
                pathToFallbackGif:  '../preloaderFallback.gif', /* set the fallback gif for browsers that suck */
                radius:             40,                         /* set the preloader radius (JUST FOR CIRCULAR PRELOADER) */
                glowColor:          null,                       /* set shadow color */
                debugMode:          true,                       /* debugger */
                onComplete:         function () {},             /* set onComplete Callback */
                onElementLoaded:    function (src,elm) { },     /* this Callback fires everytime an object is loaded */
                onUpdate:           function ( percentage ) {}  /* this function returns alway the current percentage */
            };

            var options = $.extend(defaults, options);

            /*

            @public vars
            Configuration

            */
            var preloaderType       = options.preloaderType,
                currPercentage      = options.currPercentage,
                positionX           = options.positionX,
                positionY           = options.positionY,
                lineWidth           = options.lineWidth,
                color               = options.color,
                font                = options.font,
                getFilesToLoadJSON  = options.getFilesToLoadJSON,
                pathToFallbackGif   = options.pathToFallbackGif,
                radius              = options.radius,
                fullScreen          = options.fullScreen,
                glowColor           = options.glowColor,
                debugMode           = options.debugMode,
                onComplete          = options.onComplete,
                onElementLoaded     = options.onElementLoaded,
                onUpdate            = options.onUpdate;

            /*
            
            @private var
            Configuration

            */
            var canvas              = null,
                PI                  = Math.PI,
                _CircularPreloader  = {
                                          startAngle: 1.5 * PI,
                                          endAngle: 0
                                      },
                $window             = $(window),
                CanvasID            = $(container).attr('id') == undefined ? $(container).attr('class') : $(container).attr('id'),
                _lastPercentage     = 0,
                _bytesTotal         = 0,
                _bytesLoaded        = 0,
                _firstInit          = false,
                _elementsArray      = [],
                _sizeArray          = [],
                _urlsArray          = [],
                _typeArray          = [],
                _videoArray         = [],
                _audioArray         = [],
                _videoSupportMp4    = Modernizr.video.h264,
                _videoSupportOgg    = Modernizr.video.ogg,
                _videoSupportWebm   = Modernizr.video.webm,
                _audioSupportMp3    = Modernizr.audio.mp3,
                _audioSupportOgg    = Modernizr.audio.ogg,
                _media              = [],
                _mediaI             = 0,
                _progressLS         = [],
                _canplaythroughLS   = [],
                //_this point to the global object
                _this               = this;
                        
            /*

            Utils Objects

            */
        
            
            _this.setFullscreen = function () {
                _this.logger('Setting Full screen');
                container.css({
                    position: 'fixed',
                    height: $window.height(),
                    width: $window.width(),
                    'z-index': 98,
                    top: 0
                });
                positionX = container.width() / 2;
                positionY = container.height() / 2;
                
                $(container).html('<canvas id="html5Canvas' + CanvasID + '" width="' + $(container).width() + 'px "height="' + $(container).height() + 'px"></canvas>');
                canvas = document.getElementById('html5Canvas' + CanvasID);

                //create background
                $(canvas).css({
                    position: 'fixed',
                    top: ($window.height() / 2) - ($(canvas).height() / 2),
                    left: ($window.width() / 2) - ($(canvas).width() / 2),
                    'z-index': 99
                });

                $window.bind('resize.CenterCanvas', function () {
                    $(canvas).css({
                        top: ($window.height() / 2) - ($(canvas).height() / 2),
                        left: ($window.width() / 2) - ($(canvas).width() / 2)

                    });
                    container.css({
                        position: 'fixed',
                        height: $window.height(),
                        width: $window.width(),
                        'z-index': 98
                    });

                });
            };
            _this.logger = function ( msg ) {
                if (debugMode) {
                    console.log( msg );
                }
            };
            /*
            
            END Utils Objects

            */

            /*
            
            CORE FUNCTIONS

            */

            _this.fillFilesArray = function (currEle, currSize, currSource, currType) {

                _bytesTotal += currSize;

                _this.logger('Getting file:' + currSource + ' Size: ' + currSize);

                _elementsArray.push(currEle);
                _sizeArray.push(currSize);
                _urlsArray.push(currSource);
                _typeArray.push(currType);

            };
            _this.onElementLoaded = function ( elmUrl, elm) {
                if (typeof onElementLoaded === 'function') {
                    onElementLoaded ( elmUrl, elm );
                }
            };
            _this.startLoadElements = function () {
                
                $(_elementsArray).each(function (index, element) {

                    var forcedecache = '?' + Math.random();

                    _urlsArray[index] += forcedecache;

                    if(_sizeArray[index] > 0){
                        if (_typeArray[index] == 'IMAGE') {
                            
                            var currImg = new Image ();

                            currImg.src = _urlsArray[index];

                            $(currImg).on( 'load', function () {

                                _this.onElementLoaded(_urlsArray[index],element);
                                
                                _bytesLoaded += _sizeArray[index];

                                _this.updatePercentage(_bytesLoaded);
                                _this.logger('File Loaded:' + _urlsArray[index]);
                                // preventing the memory leak
                                currImg = null;
                            });

                            _this.logger('Loading file:' + _urlsArray[index]);
                        }

                        if (_typeArray[index] == 'SCRIPT') {

                            $.getScript(_urlsArray[index],function () {

                                
                                _this.onElementLoaded(_urlsArray[index],element);
                                
                                _bytesLoaded += _sizeArray[index];
                                _this.updatePercentage(_bytesLoaded);
                                _this.logger('File Loaded:' + _urlsArray[index]);
                            });
                            _this.logger('Loading file:' + _urlsArray[index]);
                        }

                        if (_typeArray[index] == 'VIDEO' || _typeArray[index] == 'AUDIO') {

                            var i = _mediaI;

                            _media[i] = document.getElementById(_elementsArray[index]);

                            _media[i].src = _urlsArray[index];
                            // on video loading
                           
                            var alphaLoading     = _sizeArray[index],
                                tmpLoaded        = 0,
                                realLoaded       = 0;
                                    
                            _media[i].addEventListener('progress', _progressLS[i] = function (event) {

                               if (typeof _media[i].buffered !== 'undefined' ) {// Firefox 3.6 doesn't suppport
                                    

                                    if (_media[i].buffered.length > 0) {
                                        tmpLoaded = (alphaLoading / _media[i].duration) * _media[i].buffered.end(0);
                                    }
                                    
                                    realLoaded = parseInt(tmpLoaded - realLoaded);

                                    _sizeArray[index] -= realLoaded;

                                    _bytesLoaded += realLoaded;

                                    _this.updatePercentage(_bytesLoaded);

                                    realLoaded = tmpLoaded;
                                    _this.logger('File Loading in progress:' + _urlsArray[index]);
                                }
                                
                            }, true);
                            
                            // on video loaded
                            _media[i].addEventListener('canplaythrough',  _canplaythroughLS[i] = function (event) {
                                
                                _media[i].removeEventListener('progress',_progressLS[i],true);
                                _media[i].removeEventListener('canplaythrough',_canplaythroughLS[i],true);

                                _bytesLoaded += _sizeArray[index];

                                _this.onElementLoaded(_urlsArray[index],_media[i]);

                                _this.updatePercentage(_bytesLoaded);
                                _this.logger('File Loaded:' + _urlsArray[index]);
                               
                            }, true);
                            
                            _mediaI ++;

                            _this.logger('Loading file:' + _urlsArray[index]);
                            
                        }
                        
                    }
                });
            };

            _this.updatePercentage = function (_bytesLoaded) {

                _this.logger('_bytesLoaded: ' + _bytesLoaded + ' _bytesTotal'+ _bytesTotal);
                if(_bytesLoaded !== _bytesTotal) {
                    currPercentage = Math.floor((_bytesLoaded / _bytesTotal) * 100);
                }
                if (!currPercentage) {
                    currPercentage = 0;
                } else if (_bytesLoaded === _bytesTotal) {
                    currPercentage = 100;
                }
                _this.logger('Percentage: ' + currPercentage + '%');

                if (typeof onUpdate === 'function') {
                    onUpdate (currPercentage);
                }

                if (options.preloaderType === 'line' && Modernizr.canvas) {
                    _this.drawLinePreloader(currPercentage);
                }
                if ((options.preloaderType === 'circular' && Modernizr.canvas)) {
                    _this.draw_CircularPreloader(currPercentage);
                }
                if ((options.preloaderType === 'big-counter' && Modernizr.canvas)) {
                    _this.draw_BigCounterPreloader(currPercentage);
                }

            };
            _this.onComplete = function(){

                if (_lastPercentage >= 100) {
                    
                    //remove canvas from the stage
                    container.delay(1000).fadeOut(function () {
                            $window.unbind('CenterCanvas');
                            $(this).remove();
                            if (typeof onComplete === 'function') {
                                onComplete();
                            }
                    });
                }
            };
            /*
            preloader TYPE
            you can delete some of this function if you dont use it
            */

            // 'line' preloader
            _this.drawLinePreloader = function (to) {
                _this.logger('Drawing line');
                $({
                    perc: _lastPercentage
                }).animate({
                    perc: to
                }, {
                    duration: 1000,
                    step: function () {
                        if(this.perc < 101){

                            _lastPercentage = to;
                            var width = container.innerWidth(),
                                height= container.innerHeight();
                            var context = canvas.getContext('2d');
                            // calculating percentage to load
                            var alphaPercentage = (width / 100) * this.perc;
                            //clearing canvas from everithing
                            context.clearRect(0, 0, width, height);
                            //let's start drawning
                            context.restore();
                            context.beginPath();
                            //draw percentage text
                            context.font = font;
                            context.fillStyle = color;
                            context.fillText((this.perc | 0) + "%", positionX - 8, positionY - 15);
                            //width of the preloader line
                            context.lineWidth = lineWidth;
                            //color of preloader line
                            context.strokeStyle = color;
                            if(glowColor != null){
                                context.shadowOffsetX = 0;
                                context.shadowOffsetY = 0;
                                context.shadowBlur = 10;
                                context.shadowColor = glowColor;
                            }
                            context.moveTo(positionX - (width / 2), positionY);
                            context.lineTo(alphaPercentage, positionY);
                            context.stroke();
                            
                            context.save();
                            
                        }
                    },
                    complete: _this.onComplete
                });

            };

            //'circular' preloader
            _this.draw_CircularPreloader = function (to) {
                _this.logger('Drawing circle');
                _this.logger(to);
                $({
                    perc: _lastPercentage
                }).animate({
                    perc: to
                }, {
                    queque: false,
                    duration: 1000,
                    step: function () {
                        if(this.perc < 101){
                            _lastPercentage = to;
                            var context = canvas.getContext('2d');
                            // calculating percentage to load
                            var alphaPercentage = (2 / 100) * this.perc;

                            // calculating end angle of preloader
                            _CircularPreloader.endAngle = (alphaPercentage * PI) + _CircularPreloader.startAngle;
                      
                            //clearing canvas from everithing
                            context.clearRect(0, 0, container.width(), container.height());
                            context.restore();
                            //let's start drawning
                            context.beginPath();
                            //draw percentage text
                            context.font = font;
                            context.fillStyle = color;
                            context.fillText((this.perc | 0) + "%", positionX - 10, positionY + 3);

                            //width of the preloader line
                            context.lineWidth = lineWidth;
                            //color of preloader line
                            context.strokeStyle = color;
                            if(glowColor != null){
                                context.shadowOffsetX = 0;
                                context.shadowOffsetY = 0;
                                context.shadowBlur = 10;
                                context.shadowColor = glowColor;
                            }
                            context.arc(positionX, positionY, radius, _CircularPreloader.startAngle, _CircularPreloader.endAngle, false);

                            context.stroke();
                            context.save();
                            
                            
                        }
                    },
                    complete: _this.onComplete
                       
                });

            };
            //'big-counter' preloader
            _this.draw_BigCounterPreloader = function (to) {
                _this.logger('Drawing circle');
                _this.logger(to);
                $({
                    perc: _lastPercentage
                }).animate({
                    perc: to
                }, {
                    queque: false,
                    duration: 1000,
                    step: function () {
                        if(this.perc < 101){

                            

                            _lastPercentage = to;
                            var width = container.innerWidth(),
                                height= container.innerHeight();
                            var context = canvas.getContext('2d');
                            context.save();
                            // calculating percentage to load
                            var alphaPercentage = (width / 100) * this.perc;
                            //clearing canvas from everithing
                            context.clearRect(0, 0, width, height);
                            //let's start drawning
                            context.restore();
                            context.beginPath();
                            //draw percentage text
                            context.font = font;
                            context.fillStyle = color;
                            context.fillText((this.perc | 0) + "%", positionX - 8, positionY - 15);
                            //width of the preloader line
                            context.lineWidth = height;
                            //color of preloader line
                            context.strokeStyle = color;
                            if(glowColor != null){
                                context.shadowOffsetX = 0;
                                context.shadowOffsetY = 0;
                                context.shadowBlur = 10;
                                context.shadowColor = glowColor;
                            }
                            context.moveTo(positionX - (width / 2), positionY);
                            context.lineTo(alphaPercentage, positionY);
                            context.globalCompositeOperation = 'xor';
                            context.stroke();
                            context.restore();
                            
                            
                            
                            
                            
                        }
                    },
                    complete: _this.onComplete
                       
                });

            };

            //lest's start this party

            _this.init = function (options) {

                _this.logger('Start application!');
                if(!getFilesToLoadJSON && currPercentage === 0){
                    alert('plese insert a path to the json file');
                }
                //parsing json getting every sources to load
                if (getFilesToLoadJSON && (Modernizr.audio && Modernizr.video)) {

                    $.getJSON(getFilesToLoadJSON, function (data) {
                        var ElementsArr = data.files;

                        $.each(data.files, function (key, val) {

                            var tmpType   = null,
                                tmpSource = null,
                                tmpSize   = null,
                                tmpElm    = null;
                            
                            tmpType = val.type;
                            //fix image caching
                            var randomString = String((new Date()).getTime()).replace(/\D/gi, '');
                            switch (tmpType) {
                                case 'IMAGE':
                                    tmpSource = val.source,
                                    tmpSize   = val.size,
                                    tmpElm    = $('img[src="'+ tmpSource +'"]');

                                    
                                    $(tmpElm).attr('src',tmpSource+'?'+randomString);
                                    
                                break;
                                
                                case 'VIDEO':
                                    var videoId     = val.videoId;
                                        tmpElm      = videoId;
                                        //force preload
                                        $('#'+videoId).attr('preload','auto');

                                    if (_videoSupportMp4){
                                        tmpSource = val.mp4.source;
                                        tmpSize   = val.mp4.size;
                                        
                                    } if (_videoSupportOgg) {
                                        tmpSource = val.ogg.source;
                                        tmpSize   = val.ogg.size;

                                    } if (_videoSupportWebm) {
                                        tmpSource = val.webm.source;
                                        tmpSize   = val.webm.size;
                                    }
                                break;
                                case 'AUDIO':
                                    var audioId     = val.audioId;
                                        tmpElm      = audioId;
                                        //force preload
                                        $('#'+audioId).attr('preload','auto');
                                    if (Modernizr.audio.mp3  && Modernizr.audio.mp3 ){
                                        tmpSource = val.mp3.source;
                                        tmpSize   = val.mp3.size;
                                        
                                        
                                    } if (Modernizr.audio.ogg && Modernizr.audio.ogg ) {
                                        tmpSource = val.ogg.source;
                                        tmpSize   = val.ogg.size;
                               
                                    } else {
                                        tmpSource = 'we can\'t detect preferred browser audio format';
                                        tmpSize   = 0;
                                    }
                                break;
                                case 'SCRIPT':
                                    tmpSource = val.source;
                                    tmpSize   = val.size;
                                    tmpElm    = tmpSource;
                                break;
                                default:
                                    throw 'something went wrong loading the JSON file!';
                                break;
        
                            }
                            
                            _this.fillFilesArray(tmpElm, tmpSize ,tmpSource,tmpType);
                            
                            var is_last_item = (key == (ElementsArr.length - 1));

                            if (is_last_item) {
                                _this.startLoadElements();
                            }
                        });
                    });
                }
                //checking if browser support canvas element
                if (Modernizr.canvas) {
                    

                    // checking if the preloader should be full screen or not
                    if (fullScreen) {
                        //setting fullscreen
                        _this.setFullscreen();
                    } else {
                        $(container).html('<canvas id="html5Canvas' + CanvasID + '" width="' + $(container).width() + 'px "height="' + $(container).height() + 'px"></canvas>');
                        canvas = document.getElementById('html5Canvas' + CanvasID);
                    }
                    
        
                    if(getFilesToLoadJSON){
                        _this.updatePercentage(0);
                    }

                    

                    if (options.preloaderType == 'line') {
                        _this.drawLinePreloader(currPercentage);
                    }
                    if (options.preloaderType == 'circular') {
                        _this.draw_CircularPreloader(currPercentage);
                    }
                    if (options.preloaderType == 'big') {
                        _this.draw_BigCounterPreloader(currPercentage);
                    }

                } else {

                    _this.logger('Fallback');
                    var fallbackCanvas;
                    if (fullScreen) {

                        fallbackCanvas = container.append('<img src="' + pathToFallbackGif + '" alt="loading page..." /> ');
                        var fallbackImg = container.find('img').attr('src', pathToFallbackGif);

                        fallbackImg.css({
                            position: 'fixed',
                            top: ($window.height() / 2) - (fallbackImg.height() / 2),
                            left: ($window.width() / 2) - (fallbackImg.width() / 2),
                            'z-index': 99
                        });

                        container.css({
                            position: 'fixed',
                            height: $window.height(),
                            width: $window.width(),
                            'z-index': 98
                        });
                        $window.bind('resize.CenterCanvas', function () {
                            var fallbackImg = container.find('img').attr('src', pathToFallbackGif);
                            fallbackImg.css({
                                top: ($window.height() / 2) - (fallbackImg.height() / 2),
                                left: ($window.width() / 2) - (fallbackImg.width() / 2)
                            });

                            container.css({
                                position: 'fixed',
                                height: $window.height(),
                                width: $window.width()

                            });
                        });

                    } else {
                        fallbackCanvas = container.append('<img src="' + pathToFallbackGif + '" alt="loading page..." /> ');

                        fallbackCanvas.css({
                            'float': 'left',
                            marginLeft: positionX,
                            marginTop: positionY

                        });
                    }

                    $window.ready(function () {
                        fallbackCanvas.delay(1000).fadeOut(function () {
                            $(this).remove();
                        });
                    });
                }
            };

            return _this.init(options);
        }

    });

})(jQuery);