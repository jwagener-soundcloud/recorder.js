package {
  import flash.display.Sprite;
  import flash.external.ExternalInterface;

  public class FlashRecorder extends Sprite {
    public function FlashRecorder() {
      var logger:Logger;
      logger = new Logger();
      ExternalInterface.addCallback("debugLog", logger.debugLog);
      var recorder = new Recorder(logger);
      recorder.addExternalInterfaceCallbacks();
    }
  }
}