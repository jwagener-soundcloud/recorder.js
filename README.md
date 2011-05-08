# Recorder #
## Introduction ##
The Recorder provides a simple JavaScript interface to record audio in a browser.
Currently the backend is based on Adobe Flash but it might be extended as new standard emerge.

Have a look at RecButton.com as well. It's a widget allowing you to add Recording to SoundCloud functionality to your website in a very simple way.

## Getting started ##

The Recorder consists of 2 files:

* recorders.js
* recorder.swf

## Example ##
  * [most simple example](example-1.html)
  * [example using Connect with SoundCloud](example-2.html)


## API ##
### ``Recorder.initialize()`` ###

The Recorder needs to be initialized. Usage:
      Recorder.initialize({
        swfSrc: "/Recorder"
        flashContainer: document.getElementById("somecontainer"), //element where recorder.swf will be placed (needs to be 230x140 px)
        onFlashSecurity: function(){                              // callback when the flash swf needs to be visible
                                                                  // this allows you to hide/show the flashContainer element on demand.
        },
      });

If swfSrc is not passed it will default to "http://recbutton.com/recorder.swf".

If flashContainer and onFlashSecurity is not passed as options an invisible ``DIV`` element including the Recorder.swf will be
inserted at the end of the ``BODY` and will be displayed centered in the screen when necessary.

### ``Recorder.record()`` ###

Will start recording audio until ``Recorder.stop()`` is called.
Adobe Flash will ask the user for permission to access the microphone unless it was already given before.

* triggers onFlashSecurity if necessary
* triggers onRecording either immediately or after the flash security question was approved by the user

Due to recording 

      {
        showFlashSecurityMessage: function(){},
        hideFlashSecurityMessage: function(){},
      }

### ``Recorder.play()`` ###
Will play the recorded audio. Usage:

      Record.play({
        finished: function(){               // callback when playback is finished
          
        }
      })

### ``Recorder.stop()`` ###
Will stop the current recording or playing.

### ``Recorder.upload()`` ###
Will initiate a multipart POST (or PUT) to upload the recorded audio. Usage:
      Record.upload({
        method: "POST"                      // (optional) Can be "POST" or "PUT"
        url: "http://soundcloud.com/xxx",   // the url to post to 
        data_param: "track[asset_data]",    // the 
        params: {                           // additional parameters to send
          "track[title]": "some track title",
        },
        success: function(){                // callback for success upload
        
        },
        error: function(){                  // callback for errors
        
        },
        progress: NULL                      // callback for upload progress (not yet implemented)
      });

