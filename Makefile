MXMLC = "/Applications/Adobe Flash Builder 4.5/sdks/4.5.0/bin/mxmlc"

build:
	$(MXMLC) -debug=false -static-link-runtime-shared-libraries=true -optimize=true -o recorder.swf -file-specs flash/FlashRecorder.as

clean:
	rm recorder.swf

build_soundcloud:
	$(MXMLC) -debug=false -static-link-runtime-shared-libraries=true -optimize=true -o soundcloudRecorder.swf -file-specs flash/SoundcloudRecorder.as
