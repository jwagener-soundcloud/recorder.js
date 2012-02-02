package  
{
	import com.adobe.audio.format.WAVWriter;
	import com.adobe.serialization.json.JSON;
	import flash.events.TimerEvent;
	import flash.events.Event;
	import flash.events.ErrorEvent;
	import flash.events.SampleDataEvent;
	import flash.external.ExternalInterface;
	import flash.media.Microphone;
	import flash.media.Sound;
	import flash.media.SoundChannel;
	import flash.system.Capabilities;
	import flash.utils.ByteArray;
	import flash.utils.getTimer;
	import flash.utils.Timer;
	import flash.system.Security;
	import flash.system.SecurityPanel;
	import flash.events.StatusEvent;
    import flash.utils.getQualifiedClassName;
	
	import mx.collections.ArrayCollection;
	
	import ru.inspirit.net.MultipartURLLoader;

	
	public class Recorder
	{
		public function Recorder(logger)
		{
			this.logger = logger;
		}
		
		private var logger;
		public function addExternalInterfaceCallbacks():void {
			ExternalInterface.addCallback("record", 		this.record);
			ExternalInterface.addCallback("_stop",  		this.stop);
			ExternalInterface.addCallback("_play",          this.play);
			ExternalInterface.addCallback("upload",         this.upload);
			ExternalInterface.addCallback("audioData",      this.audioData);
			ExternalInterface.addCallback("showFlash",      this.showFlash);
			ExternalInterface.addCallback("recordingDuration",     this.recordingDuration);
			triggerEvent("initialized", {});
		}

		
		protected var isRecording:Boolean = false;
		protected var isPlaying:Boolean = false;
		protected var microphoneWasMuted:Boolean;
		protected var playingProgressTimer:Timer;
		protected var microphone:Microphone;
		protected var buffer:ByteArray;
		protected var sound:Sound;
		protected var channel:SoundChannel;
		protected var recordingStartTime = 0;
		protected static var sampleRate = 44.1;
		
		protected function record():void
		{
			if(!microphone){ 
				setupMicrophone();
			}
			
			if(!microphone.muted){
				notifyRecordingStarted();
			}			
			
			buffer = new ByteArray();
			microphone.addEventListener(SampleDataEvent.SAMPLE_DATA, recordSampleDataHandler);
		}
		
		protected function recordStop():int
		{
			logger.log('stopRecording');
			isRecording = false;
			triggerEvent('recordingStop', {duration: recordingDuration()});
			microphone.removeEventListener(SampleDataEvent.SAMPLE_DATA, recordSampleDataHandler);
			return recordingDuration();
		}
		
		protected function play():void
		{
			logger.log('startPlaying');
			isPlaying = true;
			triggerEvent('playingStart', {});
			buffer.position = 0;
			sound = new Sound();
			sound.addEventListener(SampleDataEvent.SAMPLE_DATA, playSampleDataHandler);
			
			channel = sound.play();
			channel.addEventListener(Event.SOUND_COMPLETE, function(){
				playStop();
			});  
			
			if(playingProgressTimer){
				playingProgressTimer.reset();
			}
			playingProgressTimer = new Timer(250);
			playingProgressTimer.addEventListener(TimerEvent.TIMER, function playingProgressTimerHandler(event:TimerEvent){
				triggerEvent('playingProgress', int(channel.position));
			});
			playingProgressTimer.start();
		}
		
		protected function stop():int
		{
			playStop();
			return recordStop();
		}
		
		protected function playStop():void
		{
			logger.log('stopPlaying');
			if(channel){
				channel.stop();
				playingProgressTimer.reset();
				
				triggerEvent('playingStop', {});
				isPlaying = false;
			}
		}
		
		/* Networking functions */ 
		
		protected function upload(uri:String, audioParam:String, parameters): void
		{
			logger.log("upload");
			buffer.position = 0;
			var wav:ByteArray = prepareWav();					
			var ml:MultipartURLLoader = new MultipartURLLoader();
			ml.addEventListener(Event.COMPLETE, onReady);
			function onReady(e:Event):void
			{
				triggerEvent('uploadSuccess', externalInterfaceEncode(e.target.loader.data));
				logger.log('uploading done');
			}
			
			if(getQualifiedClassName(parameters.constructor) == "Array"){
				for(var i=0; i<parameters.length; i++){
					ml.addVariable(parameters[i][0], parameters[i][1]);
				}
			}else{
				for(var k in parameters){
					ml.addVariable(k, parameters[k]);
				}
			}
			
			ml.addFile(wav, 'audio.wav', audioParam);
			ml.load(uri, false);
			
		}
		
		private function externalInterfaceEncode(data:String){
			return data.split("%").join("%25").split("\\").join("%5c").split("\"").join("%22").split("&").join("%26");
		}
		
		protected function audioData():String
		{
			var ret:String="";
			buffer.position = 0;				
			while (buffer.bytesAvailable > 0) 
			{
				ret += buffer.readFloat().toString() + ";";
			}
			return ret;
		}
		
		protected function showFlash():void
		{
			Security.showSettings(SecurityPanel.PRIVACY);
			triggerEvent('showFlash','');	
		}
		
		/* Recording Helper */ 
		protected function setupMicrophone():void
		{
			logger.log('setupMicrophone');
			microphone = Microphone.getMicrophone();
			microphone.setSilenceLevel(0);
			microphone.rate = sampleRate;
			microphone.gain = 50;
			microphone.addEventListener(StatusEvent.STATUS, function statusHandler(e:Event) {
				logger.log('Microphone Status Change');
				recordingStartTime = getTimer();
				if(!microphone.muted && !isRecording){
					notifyRecordingStarted();
				}
			});
			
			microphoneWasMuted = microphone.muted;
			if(microphoneWasMuted){
				logger.log('showFlashRequired');
				triggerEvent('showFlash','');
			} 
			
			logger.log('setupMicrophone done: ' + microphone.name + ' ' + microphone.muted);
		}
		
		protected function notifyRecordingStarted():void
		{
			if(microphoneWasMuted){
				microphoneWasMuted = false;
				triggerEvent('hideFlash','');
			}
			triggerEvent('recordingStart', {});
			logger.log('startRecording');
			isRecording = true;
		}
		
		/* Sample related */
		
		protected function prepareWav():ByteArray
		{
			var wavData:ByteArray = new ByteArray();
			var wavWriter:WAVWriter = new WAVWriter(); 
			buffer.position = 0;
			wavWriter.numOfChannels = 1; // set the inital properties of the Wave Writer 
			wavWriter.sampleBitRate = 16; 
			wavWriter.samplingRate = sampleRate * 1000;
			wavWriter.processSamples(wavData, buffer, sampleRate * 1000, 1);
			return wavData;
		}
		
		protected function recordingDuration():int
		{
			var latency = 650;
			var duration = int(getTimer() - recordingStartTime - latency);
			return Math.max(duration, 0);
		}
		
		protected function recordSampleDataHandler(event:SampleDataEvent):void
		{	
			while(event.data.bytesAvailable)
			{	
				var sample:Number = event.data.readFloat();
				
				buffer.writeFloat(sample);
				if(buffer.length % 40000 == 0){
					triggerEvent('recordingProgress', recordingDuration(), 	microphone.activityLevel);
				}	
			}
		}
		
		protected function playSampleDataHandler(event:SampleDataEvent):void
		{				
			for (var i:int = 0; i < 8192 && buffer.bytesAvailable; i++)
			{
				var sample:Number = buffer.readFloat();
				event.data.writeFloat(sample); 
				event.data.writeFloat(sample);  
			}
		}
		
		/* ExternalInterface Communication */
		
		protected function triggerEvent(eventName:String, arg0, arg1 = null):void
		{	
			ExternalInterface.call("Recorder.triggerEvent", eventName, arg0, arg1);
		}
	}
}