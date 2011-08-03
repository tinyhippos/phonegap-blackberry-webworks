/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2011, Research In Motion Limited.
 */

(function () {
    "use strict";
    var retAsyncCall = { "status" : PhoneGap.callbackStatus.NO_RESULT, "message" : "WebWorks Is On It" },
        retInvalidAction = { "status" : PhoneGap.callbackStatus.INVALID_ACTION, "message" : "Action not found" },

        cameraAPI = {
            execute: function (action, args, win, fail) {
                switch (action) {
                case 'takePicture':
                    blackberry.media.camera.takePicture(win, fail, fail);
                    return retAsyncCall;
                }
                return retInvalidAction;
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
            'MediaCapture' : mediaCaptureAPI
        };

    this.PluginManager = function () {
    };

    this.PluginManager.prototype.exec = function (win, fail, clazz, action, args) {
        if (plugins[clazz]) {
            return plugins[clazz].execute(action, args, win, fail);
        }

        return {"status" : PhoneGap.callbackStatus.CLASS_NOT_FOUND_EXCEPTION, "message" : "Class " + clazz + " cannot be found"};
    };
}());
