Now you can preload your HTML 5 page with this nice plug in, passing data via JSON. You can customize it changing colors and style. It can preload video, audio, images and js

![Screenshot](http://www.gianlucaguarini.com/css/img/Gianluca-Guarini-blackLogo.png)

http://www.gianlucaguarini.com/canvas-experiments/jQuery-html5Loader/index.html

USAGE
----------

You need to create a JSON file like this:


{
		"files": [
			{
				"source":"../path/to/your/script.js",
				"type":"SCRIPT",
				"size":4.096
			},
			{
				"source":"../path/to/your/image.jpg",
				"type":"IMAGE",
				"size":620
			},
			{
				"type":"VIDEO",
				"videoId":"idOfYourVideoTag",
				"webm":{
					"source":"../path/to/your/video.webm",
					"size":5054.976
				},
				"ogg":{
					"source":"../path/to/your/video.ogg",
					"size":2932.736
				},
				"mp4":{
					"source":"../path/to/your/video.mp4",
					"size":9285.632
				}
			},
			{
				"type":"AUDIO",
				"audioId":"idOfYourAudioTag",
				"mp3":{
					"source":"../path/to/your/audio.mp3",
					"size":9285.632
				},
				"ogg":{
					"source":"../path/to/your/audio.ogg",
					"size":2089.688
				}
			}
		]
	}


2 Add the scripts inside the <head> of your document:


<script src="js/jquery.min.js"></script>
<script src="js/modernizr.js"></script>
<script src="js/jQuery.html5Loader.js"></script>


3 and then Initialize the plug in before </body> using JSON file 


$('#html5Loader').html5Loader({
		getFilesToLoadJSON:'path to /files.json'
})	



4 customize plugin via css:



#html5Loader {
	width:400px;
	height:400px;
	background-color:rgba(0,0,0,0.7);
	margin:0;
	position:absolute;
}



#5 append html5Loader div container to the <code><body></code>


<body>
<div id="html5Loader"></div>

[.........]
</body>

===========================================

Preloader options

**You can set the plug in options in this way**:

----------


$('#html5Loader').html5Loader({
	option Name: 'setting'
})	


preloaderType ( __'circular'__ default)

'line'
'circular'
soon i will add some other kinds of preloader type

getFilesToLoadJSON** ( __null__ default)

lineWidth ( __5__ default)
you can set the line width

color ( __"#ffffff"__ default)
you can set the color

glowColor ( __null__ default)
you can add a golow color to everything

radius ( __40__ default)
set radius of the circular preloader

fullScreen ( __true__ default)
expand the canvas loader on the entire window

onComplete ( __function () {}__ default)
you can add an event to the end of loading

onItemLoaded ( __function (src,elm) {}__ default)
you can do something when every object is loaded;
@src is the path of the object loaded.
@elm is the tag loaded.
 
pathToFallbackGif ( __preloaderFallback.gif'__ default)
set the path for the fallback gif for the browsers that not support the canvas API
                
debugMode ( __true__ default)
you can follow the plug in events on the javascript console
				

===========================================

if you need help report the issue "here":https://github.com/GianlucaGuarini/jQuery.html5loader/issues?sort=comments&direction=desc&state=closed