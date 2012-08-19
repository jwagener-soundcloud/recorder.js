# Recorder.js
## Introduction

Recorder.js is a JavaScript library to simply record audio in the browser.
Currently the recording functionality is backed by Adobe Flash but will extended to open standards as soon as they are being adopted.

## Getting started

  * Copy these 2 files somewhere into your website directory:
    * recorder.js
    * recorder.swf
  * Add the script to your HTML: ```<script type="text/javascript" src="path/to/recorder.swf"></script>```
  * Use the ``Recorder`` object to ``initialize`` and ``record`` (see usage... :)

## Examples

  * [basic example](http://recorderjs.ponyho.st/examples/example-1.html) [src](https://github.com/jwagener/recorder.js/blob/master/examples/example-1.html)
  * [upload to soundcloud example](http://recorderjs.ponyho.st/examples/example-2.html) [src](https://github.com/jwagener/recorder.js/blob/master/examples/example-2.html)

## Usage
### ``Recorder.initialize()``

The Recorder needs to be initialized. Usage:

      Recorder.initialize({
        swfSrc: "./recorder.swf"                                  // URL to recorder.swf
        // optional:
        flashContainer: document.getElementById("somecontainer"), // (optional) element where recorder.swf will be placed (needs to be 230x140 px)
        onFlashSecurity: function(){                              // (optional) callback when the flash swf needs to be visible
                                                                  // this allows you to hide/show the flashContainer element on demand.
        },
      });

If flashContainer and onFlashSecurity is not passed as options an invisible ``DIV`` element including the Recorder.swf will be
inserted at the end of the ``BODY`` and will be displayed centered in the screen when necessary.

### Recorder.record(options)

Will start recording audio until ``Recorder.stop()`` is called.
Adobe Flash will ask the user for permission to access the microphone unless it was already given before.
If thats the case the onFlashSecurity callback from the initialization will be called.
Once the actual recording starts an onRecording callback that you can pass to as an option will be called.

Usage:

      Recorder.record({
        start: function(){                 // will be called when the recording started 
                                           // which could be delayed because Adobe Flash asks the user for microphone access permission
        }
        progress: function(milliseconds){  // will be called in a <1s frequency with the current position in milliseconds
          
        },
      });

### Recorder.play(options)

Will play the recorded audio. Usage:

      Recorder.play({
        finished: function(){               // will be called when playback is finished
          
        },
        progress: function(milliseconds){  // will be called in a <1s frequency with the current position in milliseconds
          
        }
      })

### Recorder.stop()

Will stop the current recording or playing.

### Recorder.upload()

Will initiate a multipart POST (or PUT) to upload the recorded audio. Usage:

      Recorder.upload({
        method: "POST"                             // (not implemented) (optional, defaults to POST) HTTP Method can be either POST or PUT 
        url: "http://api.soundcloud.com/tracks",   // URL to upload to (needs to have a suitable crossdomain.xml for Adobe Flash)
        audioParam: "track[asset_data]",           // Name for the audio data parameter
        params: {                                  // Additional parameters (needs to be a flat object)
          "track[title]": "some track",
          "oauth_token":  "VALID_TOKEN"
        },
        success: function(responseText){           // will be called after successful upload
        
        },
        error: function(){                  // (not implemented) will be called if an error occurrs
        
        },
        progress: NULL                      // (not yet implemented)
      });

