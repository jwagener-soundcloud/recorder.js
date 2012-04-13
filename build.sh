#!/bin/bash

export MXMLC="/Applications/Adobe Flash Builder 4.5/sdks/4.5.0/bin/mxmlc"
"$MXMLC" -debug=false -static-link-runtime-shared-libraries=true -optimize=true -o recorder.swf -file-specs flash/FlashRecorder.as
