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


  function recordForSeconds(ms, callback){
    Recorder.record({
      start: function(){
        window.setTimeout(function(){
          callback()
        }, ms)
      },
      progress: function(ms){
        progressCalled = true;
      }
    });
  }

  asyncTest("Audio start, stop, progress", 1, function(){
    var progressCalled = false;
    recordForSeconds(2000, function(){
      Recorder.stop()
      recordForSeconds(2000, function(){
        var duration = Recorder.stop();
        equals(duration < 2001, true);
        start();
      });
    })
  });
}

$(function(){
  setupRecorder("../recorder.swf", setupTests);
});
