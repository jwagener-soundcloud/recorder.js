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
      options.flashContainer.setAttribute("id", "recorderFlashContainer");
      options.flashContainer.setAttribute("style", "position: fixed; left: -9999px; top: -9999px; width: 230px; height: 140px; margin-left: 10px; border-top: 6px solid rgba(128, 128, 128, 0.6); border-bottom: 6px solid rgba(128, 128, 128, 0.6); border-radius: 5px 5px; padding-bottom: 1px; padding-right: 1px;");
      document.body.appendChild(options.flashContainer);
    }

    if(!options.onFlashSecurity){
      options.onFlashSecurity = function(){
        var flashContainer = Recorder.options.flashContainer;
        flashContainer.style.left   = ((window.innerWidth  || document.body.offsetWidth)  / 2) - 115 + "px";
        flashContainer.style.top    = ((window.innerHeight || document.body.offsetHeight) / 2) - 70  + "px";
      }
    }

    this.bind('initialized', options.initialized);
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
    this.clearBindings("recordingCancel");

    hideFlash = function(){
      var flashContainer = Recorder.options.flashContainer;
      flashContainer.style.left = "-9999px";
      flashContainer.style.top  = "-9999px";
    }

    this.bind('recordingStart',  hideFlash);
    this.bind('recordingCancel', hideFlash);

    this.bind('recordingStart',    options['start']);
    this.bind('recordingProgress', options['progress']);
    this.bind('recordingCancel',   options['cancel']);

    this.flashInterface().record();
  },
  
  stop: function(){
    return this.flashInterface()._stop();
  },
  
  play: function(options){
    options = options || {};
    this.clearBindings("playingProgress");
    this.bind('playingProgress', options['progress']);
    this.bind('playingStop', options['finished']);
    
    this.flashInterface()._play();
  },

  upload: function(options){
    options.audioParam = options.audioParam || "audio";
    options.params     = options.params || {};
    this.clearBindings("uploadSuccess");
    this.bind("uploadSuccess", function(responseText){
      options.success(Recorder._externalInterfaceDecode(responseText));
    });
    
    this.flashInterface().upload(options.url, options.audioParam, options.params);
  },
  
  audioData: function(){
    return this.flashInterface().audioData().split(";");
  },

  request: function(method, uri, contentType, data, callback){
    var callbackName = this.registerCallback(callback);
    this.flashInterface().request(method, uri, contentType, data, callbackName);
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
    if(!this.swfObject){
      return null;
    }else if(this.swfObject.record){
      return this.swfObject;
    }else if(this.swfObject.children[3].record){
      return this.swfObject.children[3];
    }
  },

  _externalInterfaceDecode: function(data){
    return data.replace(/%22/g, "\"").replace(/%5c/g, "\\").replace(/%26/g, "&").replace(/%25/g, "%");
  }
};
