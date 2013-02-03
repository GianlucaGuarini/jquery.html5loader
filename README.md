# Introduction
jQuery.html5Loader can preload <b>images</b>, html5 <b>video</b> and <b>audio</b> sources, <b>script</b> and <b>text</b> files.
This plugin needs a <b>JSON</b> file to get the files that it has to preload (or at least you can use also a javascript object), and it provides an easy API to communicate the state of loading.


## Features
* <b>smart</b>: it loads just the sources supported by the client running the script.
* <b>flexible</b>: it returns the current percentage and the object loaded, so you could be free to show this info as you like
* <b>fun</b>: inside the package you could find some preloading animation examples, customizable and ready to use




## Demo
http://www.gianlucaguarini.com/canvas-experiments/jQuery-html5Loader/

# USAGE

### 1 Create a JSON file like this, containing all the files you need to preload ( size in bytes ):

<pre><code>
{
		"files": [
			{
				"type":"SCRIPT",
				"source":"../path/to/your/script.js",
				"size":4.096
			},
			{
				"type":"IMAGE",
				"source":"../path/to/your/image.jpg",
				"size":620
			},
			{
				"type":"TEXT",
				"source":"../path/to/your/text.txt",
				"size":44
			},
			{
				"type":"VIDEO",
				"sources": {
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
				}
			},
			{
				"type":"AUDIO",
				"sources": {
					"mp3":{
						"source":"../path/to/your/audio.mp3",
						"size":9285.632
					},
					"ogg":{
						"source":"../path/to/your/audio.ogg",
						"size":2089.688
					}
				}
			}
		]
	}
</code></pre>

### 2 Import the plugin into your page:
<pre><code>
&lt;script src=&quot;http://code.jquery.com/jquery-latest.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;../js/jQuery.html5Loader.js&quot;&gt;&lt;/script&gt;

</code></pre>

### 3 Initialize the plugin setting the callback functions:

<pre><code>
$.html5Loader({
			filesToLoad:		'../js/files.json', // this could be a JSON or simply a javascript object
			onBeforeLoad:       function () {},
			onComplete:         function () {},
			onElementLoaded:    function ( obj, elm) { },
			onUpdate:           function ( percentage ) {}		
});	

</code></pre>


# API 
## Methods
- <code>onBeforeLoad</code> It is triggered before the loading process starts
- <code>onComplete</code> It is triggered when the plugin finishes to load all the sources
- <code>onMediaError</code> This function is invoked in case of any error occurred during the media element fetch
 	- <code>obj</code> original object passed to the plugin
	- <code>elm</code> html output (for type "SCRIPT" and "TEXT" this value is just a string)
- <code>onElementLoaded</code> It is triggered anytime a new element of the json array is loaded, (ATTENTION IF AN ELEMENT IS NOT SUPPORTED IT WILL NEVER PASS TROUGH THIS FUNCTION). 
 	- <code>obj</code> original object passed to the plugin
	- <code>elm</code> html output (for type "SCRIPT" and "TEXT" this value is just a string)
- <code>onUpdate</code> it is triggered anytime new bytes are loaded
	- <code>percentage</code> the percentage currently loaded
	
# KNOWN ISSUES
- Internet Explorer 9 and 10 do not return any value using the method <code>canPlayType</code> on a video or audio element ( http://modernizr.com/docs/#audio ). For these browsers we don't preload any HTML5 media format
- on mobile devices and on the iPad the preloading of any video or audio element is skipped because those devices can't preload those elements since a user interacts with them  

# TODO LIST
- create a nodejs script that is able to read files in a folder exporting the JSON file needed to preload them

