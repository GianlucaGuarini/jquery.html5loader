/**
 *
 * Version:     1.5
 * Author:      Gianluca Guarini
 * Contact:     gianluca.guarini@gmail.com
 * Website:     http://www.gianlucaguarini.com/
 * Twitter:     @gianlucaguarini
 *
 * Copyright (c) 2012 Gianluca Guarini
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
 /*global console*/
(function ($) {

    "use strict";

    $.html5Loader = function (customOptions) {
        var defaults = {
            getFilesToLoadJSON: null,                       /* set the path of JSON */
            debugMode:          true,                       /* debugger */
            onBeforeLoad:       function () {},             /* this functions fires before the preloader starts loading the sources */
            onComplete:         function () {alert("complete")},             /* set the onComplete fires when everything is loaded  */
            onElementLoaded:    function ( src, $elm) { },     /* this Callback fires anytime an object is loaded */
            onUpdate:           function ( percentage ) {}  /* this function returns alway the current percentage */
        },
        // merging the custom options with the default ones
        options = $.extend(defaults, customOptions);

        /*
        *
        * PUBLIC VAR
        * Configuration
        *
        */
        var getFilesToLoadJSON  = options.getFilesToLoadJSON,
            debugMode           = options.debugMode,
            onBeforeLoad        = options.onBeforeLoad,
            onComplete          = options.onComplete,
            onElementLoaded     = options.onElementLoaded,
            onUpdate            = options.onUpdate;

        /*
        *
        * PRIVATE VAR
        *
        */
        var $window             = $(window),
            $body               = $("body"),
            _bytesLoaded        = 0,
            _bytesTotal         = 0,
            _files              = [],
            _support            = {};
        /*
        *
        * PRIVATE METHODS
        *
        */


        /*
        *
        * @description Used to debug the application
        * @param msg: {string, object, function, array} anything we need to log in the console
        *
        */

        var log = function ( msg ) {
            if (debugMode && console) {
                console.log( msg );
            }
        };

        /*
        *
        * @description Check the support for HTML5 video and audio tags
        * @link http://modernizr.com/
        *
        */

        _support['video'] = function() {
            var elem = document.createElement('video'),
                bool = false;

            // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
            try {
                if ( bool = !!elem.canPlayType ) {
                    bool = new Boolean(bool);
                    bool.ogg = elem.canPlayType('video/ogg; codecs="theora"') .replace(/^no$/,'');

                    // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
                    bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,'');

                    bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
                }

            } catch(e) { }

            return bool;
        }();

        _support['audio'] = function() {
            var elem = document.createElement('audio'),
                bool = false;

            try {
                if ( bool = !!elem.canPlayType ) {
                    bool = new Boolean(bool);
                    bool.ogg = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                    bool.mp3 = elem.canPlayType('audio/mpeg;') .replace(/^no$/,'');

                    // Mimetypes accepted:
                    // developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                    // bit.ly/iphoneoscodecs
                    bool.wav = elem.canPlayType('audio/wav; codecs="1"') .replace(/^no$/,'');
                    bool.m4a = ( elem.canPlayType('audio/x-m4a;') ||
                                  elem.canPlayType('audio/aac;')) .replace(/^no$/,'');
                }
            } catch(e) { }

            return bool;
        }();

        /*
        *
        * @description Loops on the available source files to find the right one to preload
        * @param file: {object} the node that we need to parse to check the source supported
        *
        */

        var findSupportedSource = function ( file ) {
            var type = file.type.toLowerCase(),
                sources = file.sources;

            $.each(sources,function(tmpSource){
                if (_support[type][tmpSource]) {
                    file = file.sources[tmpSource];
                    file.type = type.toUpperCase();
                    return false;
                }
            });
            if (file.source) {
                return file;
            } else {
                return false;
            }
                
        };

        /*
        *
        * @description Output the current percentage using the onUpdate function passed as parameter to the loader
        *
        */

        var updatePercentage = function () {
            var currPercentage = 0;
            log("_bytesTotal = " + _bytesTotal);
            log("_bytesLoaded = " + _bytesLoaded);
            currPercentage = Math.round((_bytesLoaded / _bytesTotal) * 100);
            
            
            log('Percentage: ' + currPercentage + '%');

            onUpdate (currPercentage);
           
            if (!_files.length) {
                onComplete();
            }
            
        };

        /*
        *
        * @description Populate the _files array increasing the _bytesTotal var
        * @param index: file index
        * @param obj: the json node representing the file properties
        *
        */

        var arrangeData = function ( index, obj ) {

            var file = obj;
        
            if (file.type === "VIDEO" || file.type === "AUDIO") {
                file = findSupportedSource( file );
            }
            if (file){
                _bytesTotal += file.size;
                _files.push(file);
            }
            
        };

        /*
        *
        * @description Deal with data received from the json loaded
        * @param data: object
        *
        */

        var onJsonLoaded = function ( data ) {
            log("json loaded");
            $(data.files).each(arrangeData);
        };

        /*
        *
        * @description Load any kind of image
        * @param file: object
        *
        */

        var loadImage = function ( file ) {
            var defer = new $.Deferred(),
                size  = file.size,
                $image = $("<img>");
            
            $($image).on( 'load', function (e) {
                log('File Loaded:' + file.source);
                
                _bytesLoaded += size;

                onElementLoaded(file.source, $image);

                // preventing the memory leak

                $image = null;
                // removing the file from the array
                _files.splice(0,1);
                updatePercentage();
                defer.resolve();
              
            });

            $image.attr("src",file.source);

            return defer.promise();
        };

        /*
        *
        * @description Load video or audio files
        * @param file: object
        *
        */

        var loadMedia = function ( file ) {

            var defer = new $.Deferred(),
                size  = file.size,
                $media = file.type === "VIDEO" ? $("<video></video>") : $("<audio></audio>");

            
            // on Media Progress
            $media.on("loadedmetadata",function(){
                $media.on("progress",function(){
                    
                    var bytesTmpLoaded = 0;
                    log("loading in progress file:" + file.source);
                    if (this.buffered.length > 0) {
                        bytesTmpLoaded = (size / this.duration) * this.buffered.end(0);
                        size -= bytesTmpLoaded;
                        _bytesLoaded += bytesTmpLoaded;
                        updatePercentage();
                    }

                      
                });
            });
            
            // on Media Loaded
            $media.on("canplaythrough",function(){

                log('File Loaded:' + file.source);
                
                _bytesLoaded += size;
                
                

                onElementLoaded(file.source, $media);

                _files.splice(0,1);

                $media.off();
                $media = null;
                updatePercentage();
                defer.resolve();
            });

            $media.attr({
                preload:'auto',
                src: file.source
            });

            

            return defer.promise();
        };

        /*
        *
        * @description Load scripts making them available to the DOM
        * @param file: object
        *
        */

        var loadScript = function ( file ) {
            var defer = new $.Deferred(),
                size  = file.size;
            $.getScript(file.source, function(){

                 log('File Loaded:' + file.source);

                _bytesLoaded += size;

                

                onElementLoaded(file.source, file);

                // removing the file from the array
                _files.splice(0,1);
                updatePercentage();
                defer.resolve();
            });
        
            return defer.promise();
        };

        /*
        *
        * @description Load text files
        * @param file: object
        *
        */

        var loadText = function ( file ) {
            var defer = new $.Deferred();
            _files.splice(0,1);
            defer.resolve();
            return defer.promise();
        };

        /*
        *
        * @description start loading all the files
        *
        */

        var loadingLoop = function () {
            
            
            // if there are still files to load we keep looping

            if (_files.length) {
                log("preloading files");
                var file = _files[0];
                log("file to preload:"+ file.source);

                switch (file.type) {
                    case "IMAGE":
                        loadImage(file).then(loadingLoop);
                    break;
                    case "VIDEO":
                    case "AUDIO":
                        loadMedia(file).then(loadingLoop);
                    break;
                    case "SCRIPT":
                        loadScript(file).then(loadingLoop);
                    break;
                    case "TEXT":
                        loadText(file).then(loadingLoop);
                    break;
                    default:
                        return false;
                }
            } else {
                return false;
            }
            
        };

        /*
        *
        * PUBLIC METHODS
        *
        */

        /*
        *
        * @description Start preloading the page
        *
        */

        this.init = function () {
            log("plugin initialized");

            var defer = new $.Deferred(),
                promise = defer.promise();
            onBeforeLoad();
            $.getJSON(getFilesToLoadJSON,defer.resolve);

            // once the json is loaded before start loading we arrange all data received
            defer.pipe($.proxy(onJsonLoaded,this));

            // ready to preload all the files
            promise.then($.proxy(updatePercentage,this));
            promise.then($.proxy(loadingLoop,this));
            
        };

        // make the public methos accessible from the extern
        return this;
        
    };

})(jQuery);