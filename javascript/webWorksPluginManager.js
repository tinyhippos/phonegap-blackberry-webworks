/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, Research In Motion Limited.
 */

(function (){

	this.PluginManager = function() {
	};
	
	PluginManager.prototype.exec = function(win, fail, clazz, action, args) {
		if(plugins[clazz]){
			return plugins[clazz].execute(action, args, win, fail);
		}
        
        return {"status" : PhoneGap.callbackStatus.CLASS_NOT_FOUND_EXCEPTION, "message" : "Class " + clazz+ " cannot be found"};
	};
    
    PluginManager.prototype.resume = function(){};
    PluginManager.prototype.pause = function(){};
    PluginManager.prototype.destroy = function(){};
    
    var retAsyncCall = { "status" : PhoneGap.callbackStatus.NO_RESULT, "message" : "WebWorks Is On It" },
        retInvalidAction = { "status" : PhoneGap.callbackStatus.INVALID_ACTION, "message" : "Action not found" },
        
        cameraAPI = {
            execute: function(action, args, win, fail) {
                switch (action) {
                    case 'takePicture':
                        blackberry.media.camera.takePicture(win, fail, fail);
                        break;
                    default:
                        return retInvalidAction;
                }

                return retAsyncCall;            
            }
        },

        deviceAPI = {
            execute: function(action, args, win, fail) {
                switch (action) {
                    case 'getDeviceInfo':						
                        return { "status" : 1, "message" : {"version" : blackberry.system.softwareVersion,
                                                            "name" : blackberry.system.model,
                                                            "uuid" : blackberry.identity.PIN,
                                                            "phonegap" : "1.0.0rc1"}};
                } 
                
                return retInvalidAction;
            }
        },
        
        notificationAPI = {
            execute: function(action, args, win, fail) {
                //Unpack and map the args
                var msg = args[0];
                var title = args[1];
                
                
                switch(action) {
                    case 'alert':
                        var btnLabel = args[2];
                        blackberry.ui.dialog.customAskAsync.apply(this, [ msg, [ btnLabel ], win, { "title" : title } ]);
                        break;
                    case 'confirm':	
                        var btnLabels = args[2].split(",");
                        blackberry.ui.dialog.customAskAsync.apply(this, [msg, btnLabels, win, {"title" : title} ]);
                        break;
                    default:
                        return retInvalidAction;
                }  
                
                return retAsyncCall;
            }
        },

        mediaCaptureAPI = {
            execute: function(action, args, win, fail) {
                var limit = args[0],
                    pictureFiles = [],
                    captureMethod;

                function captureCB(filePath) {
                    var mediaFile;
                    
                    if (filePath) {
                        mediaFile = new MediaFile();
                        mediaFile.fullPath = filePath;
                        pictureFiles.push(mediaFile);
                    }
        
                    if (limit > 0) {
                        limit--;
                        blackberry.media.camera[captureMethod](takePictureCB, fail, fail);
                        return;
                    }

                    win(pictureFiles);

                    return retAsyncCall; 
                }

                switch(action) {
                    case 'getSupportedAudioModes':
                    case 'getSupportedImageModes':
                    case 'getSupportedVideoModes':
                        return {"status": PhoneGap.callbackStatus.OK, "message": []};
                    case 'captureImage':
                        captureMethod = "takePicture";
                        captureCB();
                        break;
                    case 'captureVideo':
                        captureMethod = "takeVideo";
                        captureCB();
                        break;
                    case 'captureAudio':
                        return {"status": PhonGap.callbackStatus.INVALID_ACTION, "message": "captureAudio is not currently supported"};
                }

                return retAsyncCall;
            }
        },

        plugins = {
            'Camera' : cameraAPI,
            'Device' : deviceAPI,
            'Notification' : notificationAPI,
            'MediaCapture' : mediaCaptureAPI
        };
}());
