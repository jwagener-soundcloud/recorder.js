var Recorder = {
  swfCode: '<object id="Recorder" style="z-index: 200" width="231" height="141" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"><param value="transparent" name="wmode"><param value="RECORDER_URI" name="movie"><param value="always" name="allowScriptAccess"><embed width="231" height="141" wmode="transparent" name="Recorder" type="application/x-shockwave-flash" src="RECORDER_URI" allowscriptaccess="always">  </object>',
  swfObject: null,
  _callbacks: {},
  _events: {},
  options: {},
  initialize: function(options){
    options = options || {};
    this.options = options;
    if(!options.flashContainer){
      options.flashContainer = document.createElement("div");
      options.flashContainer.style.left     = "-230px";
      options.flashContainer.style.top      = "-140px";
      options.flashContainer.style.width    = "230px";
      options.flashContainer.style.height   = "140px";
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
    options.swfSrc = options.swfSrc;
    this.bind('showFlash', options.onFlashSecurity);
    options.flashContainer.innerHTML = this.swfCode.replace(/RECORDER_URI/g, options.swfSrc);
    this.swfObject = options.flashContainer.children[0];
  },

  clear: function(){
    Recorder._events = {};
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

    this.bind('recordingStart', options['start']);
    this.bind('recordingProgress', options['progress']);

    this.flashInterface().record();
  },
  
  stop: function(){
    return this.flashInterface().stop();
  },
  
  play: function(options){
    options = options || {};
    this.clearBindings("playingProgress");
    this.bind('playingProgress', options['progress']);
    this.bind('playingStop', options['finished']);
    
    this.flashInterface().play();
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
  
  audioData: function(){
    return this.flashInterface().audioData().split(";");
  },

  request: function(method, uri, params, callback){
    var callbackName = this.registerCallback(callback);
    this.flashInterface().request(method, uri, params, callbackName);
  },
  
  clearBindings: function(eventName){
    Recorder._events[eventName] = [];
  },

  bind: function(eventName, fn){
    if(!Recorder._events[eventName]){ Recorder._events[eventName] = [] }
    Recorder._events[eventName].push(fn);
  },
  
  triggerEvent: function(eventName, arg0, arg1){
    for(var cb in Recorder._events[eventName]){
      Recorder._events[eventName][cb](arg0, arg1);
    }
  },

  triggerCallback: function(name, args){
    Recorder._callbacks[name].apply(null, args);
  },

  registerCallback: function(fn){
    var name = "CB" + parseInt(Math.random() * 999999, 10);
    Recorder._callbacks[name] = fn;
    return name;
  },

  flashInterface: function(){
    return this.swfObject.record ? this.swfObject : this.swfObject.children[3];
  },
};
