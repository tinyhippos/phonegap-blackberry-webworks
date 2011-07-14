	/**
	 * ASSUMPTION: by the time this is called, args has been JSON.parsed
     */
    function _takePicture (successCallback, errorCallback, args) {
        //Do not support the base64 return type in Tablet for now
    	//Potentially use the File API to get the data?
    	if (args.destinationType == 1) {
     		blackberry.media.camera.takePicture(successCallback, null, errorCallback);
    	}
       	else {
     		errorCallback("Camera Error: only DestinationType.DATA_URL is currently supported");
     	}
    };