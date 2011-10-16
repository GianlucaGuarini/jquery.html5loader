/**
 *
 * Version:     1.0
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
                onComplete:         function () {},             /* set onComplete Callback */
                onItemLoaded:       function (src,elm) {},      /* this Callback fire everytime an object is loaded */
                pathToFallbackGif:  '../preloaderFallback.gif',    /* set the fallback gif for browsers that suck */
                radius:             40,                         /* set the preloader radius (JUST FOR CIRCULAR PRELOADER) */
                glowColor:          null,                       /* set shadow color */
                debugMode:          false                       /* debugger */
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
                onComplete          = options.onComplete,
                onItemLoaded        = options.onItemLoaded,
                pathToFallbackGif   = options.pathToFallbackGif,
                radius              = options.radius,
                fullScreen          = options.fullScreen,
                glowColor           = options.glowColor;
                debugMode           = options.debugMode;

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
                CanvasID            = $(container).attr('id') == undefined ? $(container).attr('class') : $(container).attr('id'),
                _lastPercentage     = 0,
                _bytesTotal         = 0,
                _bytesLoaded        = 0,
                _firstInit          = false,
                _elementsArray      = [],
                _sizeArray          = [],
                _sourceArray        = [],
                _typeArray          = [],
                _videoArray         = [],
                _audioArray         = [],
                _videoSupportMp4    = Modernizr.video.h264,
                _videoSupportOgg    = Modernizr.video.ogg,
                _videoSupportWebm   = Modernizr.video.webm,
                _audioSupportMp3    = Modernizr.audio.mp3,
                _audioSupportOgg    = Modernizr.audio.ogg,
                //_that point to the global object
                _that               = this;
                        
            /* 

            Utils Objects

            */
            _that.fileExtension = function (fname) {
                var pos = fname.lastIndexOf(".");
                var strlen = fname.length;
                if (pos != -1 && strlen != pos + 1) {
                    var ext = fname.split(".");
                    var len = ext.length;
                    var extension = ext[len - 1].toLowerCase();
                } else {
                    extension = "No extension found";
                }
                return extension;
            };
            
            _that.setFullscreen = function () {
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
            }
            /* 
            
            END Utils Objects

            */

            /* 
            
            CORE FUNCTIONS

            */

            _that.fillFilesArray = function (currEle, currSize, currSource, currType) {

                _bytesTotal += currSize;

                debugMode == true ? console.log('Getting file:' + currSource + ' Size: ' + currSize) : '';

                _elementsArray.push(currEle);
                _sizeArray.push(currSize);
                _sourceArray.push(currSource);
                _typeArray.push(currType);

            };
            
            _that.startLoadElements = function () {

                $(_elementsArray).each(function (index, element) {
                    if(_sizeArray[index] > 0){
                        if (_typeArray[index] == 'IMAGE') {
                            


                            $(_elementsArray[index]).load(function () {

                                if ($(_elementsArray[index])) {
                                    var _onItemLoaded = new onItemLoaded(_sourceArray[index],element);
                                }
                                _bytesLoaded += _sizeArray[index];
                                _that.updatePercentage(_bytesLoaded);
                                debugMode == true ? console.log('File Loaded:' + _sourceArray[index]) : '';
                            });
                            debugMode == true ? console.log('Loading file:' + _sourceArray[index]) : '';
                        }

                        if (_typeArray[index] == 'SCRIPT') {

                            $.getScript(_elementsArray[index],function () {

                                if ($(_elementsArray[index])) {
                                    var _onItemLoaded = new onItemLoaded(_sourceArray[index],element);
                                }
                                _bytesLoaded += _sizeArray[index];
                                _that.updatePercentage(_bytesLoaded);
                                debugMode == true ? console.log('File Loaded:' + _sourceArray[index]) : '';
                            });
                            debugMode == true ? console.log('Loading file:' + _sourceArray[index]) : '';
                        }

                        if (_typeArray[index] == 'VIDEO') {

                            var video = document.getElementById(_elementsArray[index]);

                            // on video loaded
                            video.addEventListener('canplaythrough', _that.onMediaLoaded = function (event) {
                                if ($(_elementsArray[index])) {
                                    var _onItemLoaded = new onItemLoaded(_sourceArray[index],video);
                                }
                               
                                _bytesLoaded += _sizeArray[index];
                                _that.updatePercentage(_bytesLoaded);
                                debugMode == true ? console.log('File Loaded:' + _sourceArray[index]) : '';
                            }, true);
                           debugMode == true ? console.log('Loading file:' + _sourceArray[index]) : '';
                            
                        }
                        if (_typeArray[index] == 'AUDIO') {

                            var audio = document.getElementById(_elementsArray[index]);

                            audio.addEventListener('canplaythrough', _that.onMediaLoaded = function (event) {
                                if ($(_elementsArray[index])) {
                                    var _onItemLoaded = new onItemLoaded(_sourceArray[index],audio);
                                }
                                
                                _bytesLoaded += _sizeArray[index];
                                _that.updatePercentage(_bytesLoaded);
                                debugMode == true ? console.log('File Loaded:' + _sourceArray[index]) : '';

                            }, true);
                           debugMode == true ? console.log('Loading file:' + _sourceArray[index]) : '';
                            
                        }
                    }
                });
            };

            _that.updatePercentage = function (_bytesLoaded) {


                currPercentage = ~~ (((_bytesLoaded / _bytesTotal) * 100) | 0) + 1; /* +1 force math round to get full 100% percentage*/

                debugMode == true ? console.log('Percentage: ' + ~~ (currPercentage) + '%') : '';

           

                if (options.preloaderType == 'line' && Modernizr.canvas) {
                    _that.drawLinePreloader(currPercentage);
                }
                if ((options.preloaderType == 'circular' && Modernizr.canvas)) {
                    _that.draw_CircularPreloader(currPercentage);
                }

            };
            _that.onComplete = function(){

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
            /* 
            preloader TYPE
            you can delete some of this function if you dont use it
            */

            // 'line' preloader
            _that.drawLinePreloader = function (to) {
                debugMode == true ? console.log('Drawing line') : '';
                $({
                    perc: _lastPercentage
                }).animate({
                    perc: to
                }, {
                    duration: 1000,
                    step: function () {
                        if(this.perc <= 101){
                            _lastPercentage = to;
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
                            context.moveTo(positionX - (container.width() / 2), positionY)
                            context.lineTo(alphaPercentage, positionY)
                            context.stroke();
                           
                            
                        }
                    },
                    complete: _that.onComplete 
                });

            };

            //'circular' preloader
            _that.draw_CircularPreloader = function (to) {
                debugMode == true ? console.log('Drawing circle') : '';
                debugMode == true ? console.log(to) : '';
                $({
                    perc: _lastPercentage
                }).animate({
                    perc: to
                }, {
                    queque: false,
                    duration: 1000,
                    step: function () {
                        if(this.perc <= 101){
                            _lastPercentage = to;
                            var context = canvas.getContext('2d');
                            // calculating percentage to load
                            var alphaPercentage = (2 / 100) * this.perc;

                            // calculating end angle of preloader
                            _CircularPreloader.endAngle = (alphaPercentage * PI) + _CircularPreloader.startAngle;
                      
                            //clearing canvas from everithing
                            context.clearRect(0, 0, container.width(), container.height());
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
                            
                        
                        }
                    },
                    complete: _that.onComplete
                       
                });

            };

            //lest's start this party

            _that.init = function (options) {

                debugMode == true ? console.log('Start application!') : '';
                if(!getFilesToLoadJSON && currPercentage == 0){
                    alert('plese insert a path to json file');
                }
                //parsing json getting every sources to load
                if (getFilesToLoadJSON && (Modernizr.audio && Modernizr.video)) {

                    $.getJSON(getFilesToLoadJSON, function (data) {
                        var ElementsArr = data.files;

                        $.each(data.files, function (key, val) {

                            var _type   = null,
                                _source = null,
                                _size   = null,
                                _elm    = null;
                            
                            _type = val.type;

                            switch (_type) {
                                case 'IMAGE':
                                var _source = val.source,
                                    _size   = val.size,
                                    _elm    = $('img[src="'+ _source +'"]');

                                    //fix image caching
                                    var randomString = String((new Date()).getTime()).replace(/\D/gi, '');
                                    $(_elm).attr('src',_source+'?'+randomString)
                                    
                                break;
                                
                                case 'VIDEO':
                                    var videoId = val.videoId,
                                        _elm    = videoId;
                                        //force preload
                                        $('#'+_elm).attr('preload','auto');
                                    if (_videoSupportMp4){
                                        _source = val.mp4.source;
                                        _size   = val.mp4.size;
                                        
                                    } if (_videoSupportOgg) {
                                        _source = val.ogg.source;
                                        _size   = val.ogg.size;

                                    } if (_videoSupportWebm) {
                                        _source = val.webm.source;
                                        _size   = val.webm.size;
                                    }
                                break;
                                case 'AUDIO':
                                    var audioId = val.audioId,
                                        _elm    = audioId;
                                        //force preload
                                        $('#'+_elm).attr('preload','auto');
                                    if (Modernizr.audio.mp3 != '' && Modernizr.audio.mp3 != false ){
                                        _source = val.mp3.source;
                                        _size   = val.mp3.size;
                                        
                                        
                                    } if (Modernizr.audio.ogg != '' && Modernizr.audio.ogg != false ) {
                                        _source = val.ogg.source;
                                        _size   = val.ogg.size; 
                               
                                    } else {
                                        _source = 'we can\'t detect preferred browser audio format';
                                        _size   = 0; 
                                    }
                                break;
                                case 'SCRIPT':
                                var _source = val.source,
                                    _size   = val.size,
                                    _elm    = _source;
                                break;
                                default:
                                console.log('something was wrong during json loading!');
                                break;
        
                            }
                            
                            _that.fillFilesArray(_elm, _size,_source,_type)
                            
                            var is_last_item = (key == (ElementsArr.length - 1));

                            if (is_last_item == true) {
                                _that.startLoadElements();
                            }
                        });
                    })
                }
                //checking if browser support canvas element 
                if (Modernizr.canvas) {
                    

                    // checking if the preloader should be full screen or not
                    if (fullScreen == true) {
                        //setting fullscreen
                        _that.setFullscreen();
                    } else {
                        $(container).html('<canvas id="html5Canvas' + CanvasID + '" width="' + $(container).width() + 'px "height="' + $(container).height() + 'px"></canvas>');
                        canvas = document.getElementById('html5Canvas' + CanvasID);
                    }
                    
        
                    if(getFilesToLoadJSON){
                        _that.updatePercentage(0);
                    }

                    

                    if (options.preloaderType == 'line') {
                        _that.drawLinePreloader(currPercentage);
                    }
                    if (options.preloaderType == 'circular') {
                        _that.draw_CircularPreloader(currPercentage);
                    }

                } else {

                    debugMode == true ? console.log('Fallback') : '';
                   
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
                            $(this).remove();
                        });
                    });
                }
            };

            return _that.init(options);
        }

    });

})(jQuery);