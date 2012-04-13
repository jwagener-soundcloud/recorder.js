package {
  import flash.display.Sprite;
  import flash.external.ExternalInterface;

  public class SoundcloudRecorder extends Sprite {
    var logger:Logger;

    public function SoundcloudRecorder() {
      Security.allowDomain("*");
      ExternalInterface.addCallback("request",  request);
      logger   = new Logger();
      ExternalInterface.addCallback("debugLog", logger.debugLog);
      var recorder = new Recorder(logger);
      recorder.addExternalInterfaceCallbacks();
    }


  protected function request(method:String, url:String, contentType:String, data:String, callbackName:String):void
    {
      var request:URLRequest = new URLRequest(url);
      request.method = method;
      request.requestHeaders = new Array(new URLRequestHeader("Content-Type", contentType));
      
      // workaround to not ignore method when body is blank
      // see http://forums.adobe.com/thread/746809?decorator=print&displayFullThread=true
      if(data == null || data == ""){
        data = " ";
      }
      
      request.data = data;
      
      var _subLoader = new URLLoader();
      var callback = function(e:Event){
        e.target.data = externalInterfaceEncode(e.target.data);
        ExternalInterface.call("Recorder.triggerCallback", callbackName, [e.target.data, e]);
      }
      
      _subLoader.addEventListener(Event.COMPLETE, callback);
      _subLoader.addEventListener(IOErrorEvent.IO_ERROR, callback);
      _subLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, callback);
      _subLoader.dataFormat = URLLoaderDataFormat.TEXT;
      _subLoader.load( request );
    }
    
    private function externalInterfaceEncode(data:String){
      return data.split("%").join("%25").split("\\").join("%5c").split("\"").join("%22").split("&").join("%26");
    }
  }
}