

/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2011, Research In Motion Limited.
 */

if (!window.phonegap) { window.phonegap = {}; }

phonegap.PluginManager = (function (webworksPluginManager) {
    /**
     * Private list of HTML 5 audio objects, indexed by the PhoneGap media object ids
     */
    var audioObjects = {},
        retInvalidAction = { "status" : PhoneGap.callbackStatus.INVALID_ACTION, "message" : "Action not found" },
        retAsyncCall = { "status" : PhoneGap.callbackStatus.NO_RESULT, "message" : "WebWorks Is On It" },
        deviceAPI = {
            execute: function (webWorksResult, action, args, win, fail) {
                if (action === 'getDeviceInfo') {
                    return {"status" : PhoneGap.callbackStatus.OK,
                            "message" : {"version" : blackberry.system.softwareVersion,
                            "name" : blackberry.system.model,
                            "uuid" : blackberry.identity.PIN,
                            "platform" : "PlayBook",
                            "phonegap" : "1.0.0rc1"}};
                }
                return retInvalidAction;
            }
        },
        loggerAPI = {
            execute: function (webWorksResult, action, args, win, fail) {
                switch (action) {
                case 'log':
                    console.log(args);
                    return {"status" : PhoneGap.callbackStatus.OK,
                            "message" : 'Message logged to console: ' + args};
                case 'enable':
                    return {"status" : PhoneGap.callbackStatus.OK,
                            "message" : 'Nothing to enable on PlayBook'};
                }
                return retInvalidAction;
            }
        },
        mediaAPI = {
            execute: function (action, args, win, fail) {
                if (!args.length) {
                    return {"status" : 9, "message" : "Media Object id was not sent in arguments"};
                }

                var id = args[0],
                    audio = audioObjects[id],
                    result;

                switch (action) {
                case 'startPlayingAudio':
                    if (args.length === 1) {
                        return {"status" : 9, "message" : "Media source argument not found"};
                    }

                    if (audio) {
                        audio.pause();
                        audioObjects[id] = undefined;
                    }

                    audio = audioObjects[id] = new Audio(args[1]);
                    audio.play();

                    result = {"status" : 1, "message" : "Audio play started" };

                case 'stopPlayingAudio':
                    if (!audio) {
                        return {"status" : 2, "message" : "Audio Object has not been initialized"};
                    }

                    audio.pause();
                    audioObjects[id] = undefined;

                    result = {"status" : 1, "message" : "Audio play stopped" };

                case 'seekToAudio':
                    if (!audio) {
                        return {"status" : 2, "message" : "Audio Object has not been initialized"};
                    }
                    if( args.length == 1 ) {
                        return {"status" : 9, "message" : "Media seek time argument not found"};
                    }

                    try {
                        audio.currentTime = args[1];
                    }
                    catch (e) {
                        console.log('Error seeking audio: ' + e);
                        return {"status" : 3, "message" : "Error seeking audio: " + e};
                    }

                    result = {"status" : 1, "message" : "Seek to audio succeeded" };

                case 'pausePlayingAudio':
                    if (!audio) {
                        return {"status" : 2, "message" : "Audio Object has not been initialized"};
                    }

                    audio.pause();

                    result = {"status" : 1, "message" : "Audio paused" };

                case 'getCurrentPositionAudio':
                    if (!audio) {
                        return {"status" : 2, "message" : "Audio Object has not been initialized"};
                    }

                    result = {"status" : 1, "message" : audio.currentTime };

                case 'getDuration':
                    if (!audio) {
                        return {"status" : 2, "message" : "Audio Object has not been initialized"};
                    }

                    result = {"status" : 1, "message" : audio.duration };

                case 'startRecordingAudio':
                    if( args.length <= 1 ) {
                        return {"status" : 9, "message" : "Media start recording, insufficient arguments"};
                    }

                    blackberry.media.microphone.record(args[1], successCallback, errorCallback);

                case 'stopRecordingAudio':

                case 'release':
                    if (audio) {
                        audioObjects[id] = undefined;
                        delete audio;
                    }

                    result = {"status" : 1, "message" : "Media resources released"};

                default:
                    result = retInvalidAction;
                }

            return result;
            }
        },

        networkAPI = {
            execute: function(webWorksResult, action, args, win, fail) {
                var connectionType = Connection.NONE,
                eventType = "offline",
                callbackID,
                request;

                /**
                 * For PlayBooks, we currently only have WiFi connections, so return WiFi if there is
                 * any access at all.
                 * TODO: update if/when PlayBook gets other connection types...
                 */
                switch(action) {
                case 'getConnectionInfo':
                    if (blackberry.system.hasDataCoverage()) {
                        connectionType = Connection.WIFI;
                        eventType = "online";
                    }

                    //Register an event handler for the networkChange event
                    callbackID = blackberry.events.registerEventHandler("networkChange", win);

                    //pass our callback id down to our network extension
                    request = new blackberry.transport.RemoteFunctionCall("com/phonegap/getConnectionInfo");
                    request.addParam("networkStatusChangedID", callbackID);
                    request.makeSyncCall();

                    return { "status" : PhoneGap.callbackStatus.OK, "message" : {"type" : connectionType, "event" : eventType } };
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
                    return retAsyncCall;
                case 'confirm':
                    var btnLabels = args[2].split(",");
                    blackberry.ui.dialog.customAskAsync.apply(this, [msg, btnLabels, win, {"title" : title} ]);
                    return retAsyncCall;
                }
                return retInvalidAction;

            }
        },


        plugins = {
                'Device' : deviceAPI,
                'Logger' : loggerAPI,
                'Media' : mediaAPI,
                'Network Status' : networkAPI,
                'Notification' : notificationAPI
        };

    this.PlayBookPluginManager = function() {
        PhoneGap.onNativeReady.fire();
    };

    this.PlayBookPluginManager.prototype.exec = function(win, fail, clazz, action, args) {
        var wwResult = webworksPluginManager.exec(win, fail, clazz, action, args);

        //We got a sync result or a not found from WW that we can pass on to get a native mixin
        //For async calls there's nothing to do
        if(wwResult.status == PhoneGap.callbackStatus.OK || wwResult.status == PhoneGap.callbackStatus.CLASS_NOT_FOUND_EXCEPTION && plugins[clazz]){
            return plugins[clazz].execute(wwResult.message, action, args, win, fail);
        }

        return wwResult;
    };

    PlayBookPluginManager.prototype.resume = function(){};
    PlayBookPluginManager.prototype.pause = function(){};
    PlayBookPluginManager.prototype.destroy = function(){};





    //Instantiate it
    return new PlayBookPluginManager();
})(new PluginManager());
