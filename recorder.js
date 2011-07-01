var Recorder = {
  swfCode: '<object id="Recorder" style="z-index: 200" width="231" height="141" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"><param value="transparent" name="wmode"><param value="RECORDER_URI" name="movie"><param value="always" name="allowScriptAccess"><embed width="231" height="141" wmode="transparent" name="Recorder" type="application/x-shockwave-flash" src="RECORDER_URI" allowscriptaccess="always">  </object>',
  swfObject: null,
  events: {},
  options: {},
  initialize: function(options){
    options = options || {};
    this.options = options;
    if(!options.flashContainer){
      options.flashContainer = document.createElement("div");
      options.flashContainer.style.left= "-230px";
      options.flashContainer.style.top = "-140px";
      options.flashContainer.style.width  = "230px";
      options.flashContainer.style.height = "140px";
      options.flashContainer.style.position = "absolute";
      
      document.body.appendChild(options.flashContainer);
    }

    if(!options.onFlashSecurity){
      options.onFlashSecurity = function(){
        var flashContainer = Recorder.options.flashContainer;
        flashContainer.style.left   = (window.innerWidth / 2) - 115 + "px";
        flashContainer.style.top    = (window.innerHeight / 2) - 70 + "px";
      }
    }
    options.swfSrc = options.swfSrc || "http://recorder.dev/recorder.swf";
    this.bind('showFlash', options.onFlashSecurity);
    options.flashContainer.innerHTML = this.swfCode.replace(/RECORDER_URI/g, options.swfSrc);
    this.swfObject = options.flashContainer.children[0];
  },

  clear: function(){
    Recorder.events = {};
  },

  record: function(options){
    options = options || {};
    this.clearBindings("recordingStart");
    this.clearBindings("recordingProgress");

    this.bind('recordingStart', function(){
      var flashContainer = Recorder.options.flashContainer;
      flashContainer.style.left = undefined;
      flashContainer.style.top  = undefined;
    });

//    this.bind('recordingStart', options['onRecording']);
    this.bind('recordingStart', options['start']);
    this.bind('recordingProgress', options['progress']);

    this.flashInterface().startRecording();
  },
  
  stop: function(){
    this.flashInterface().stopRecording();
    this.flashInterface().stopPlaying();
  },
  
  play: function(options){
    this.clearBindings("playingProgress");
    this.bind('playingProgress', options['progress']);
    
    this.flashInterface().startPlaying();
  },

  upload: function(options){
    options.audioParam = options.audioParam || "audio";
    options.params     = options.params || {};
    this.clearBindings("uploadSuccess");
    this.bind("uploadSuccess", function(responseText){
      options.success(responseText);
    });
    
    this.flashInterface().upload(options.url, options.audioParam, options.params);
  },
  
  data: function(pitch){
    var rawData = this.flashInterface().data().split(";");
    return rawData;
  },
  
  clearBindings: function(eventName){
    Recorder.events[eventName] = [];
  },

  bind: function(eventName, fn){
    if(!Recorder.events[eventName]){ Recorder.events[eventName] = [] }
    Recorder.events[eventName].push(fn);
  },
  
  trigger: function(eventName, args){
    for(var cb in Recorder.events[eventName]){
      Recorder.events[eventName][cb](args);
    }
  },

  flashInterface: function(){
    return this.swfObject.startRecording ? this.swfObject : this.swfObject.children[3];
  },
};
