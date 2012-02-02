function setupRecorder(swfSrc, callback){
  Recorder.initialize({
    "swfSrc": swfSrc,
    initialized: callback
  });  
}

function setupTests(){
  test("Recorder.swf Exposed Functions", function() {
    var fi = Recorder.flashInterface();
    ok(fi.record            != undefined, "record()");
    ok(fi._stop             != undefined, "_stop()");
    ok(fi._play             != undefined, "_play()");
    ok(fi.upload            != undefined, "upload()");
    ok(fi.audioData         != undefined, "audioData()");
    ok(fi.showFlash         != undefined, "showFlash()");
    ok(fi.debugLog          != undefined, "debugLog()");
    ok(fi.recordingDuration != undefined, "recordingDuration()");
  });
}

$(function(){
  setupRecorder("../flash/bin-release/FlashRecorder.swf", setupTests);
});
