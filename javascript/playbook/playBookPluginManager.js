

/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2011, Research In Motion Limited.
 */

phonegap.PluginManager = (function (webworksPluginManager) {
    "use strict";

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
                        result = {"status" : 9, "message" : "Media source argument not found"};

                    }

                    if (audio) {
                        audio.pause();
                        audioObjects[id] = undefined;
                    }

                    audio = audioObjects[id] = new Audio(args[1]);
                    audio.play();

                    result = {"status" : 1, "message" : "Audio play started" };
                    break;
                case 'stopPlayingAudio':
                    if (!audio) {
                        return {"status" : 2, "message" : "Audio Object has not been initialized"};
                    }

                    audio.pause();
                    audioObjects[id] = undefined;

                    result = {"status" : 1, "message" : "Audio play stopped" };
                    break;
                case 'seekToAudio':
                    if (!audio) {
                        result = {"status" : 2, "message" : "Audio Object has not been initialized"};
                    } else if (args.length === 1) {
                        result = {"status" : 9, "message" : "Media seek time argument not found"};
                    } else {
                        try {
                            audio.currentTime = args[1];
                        } catch (e) {
                            console.log('Error seeking audio: ' + e);
                            return {"status" : 3, "message" : "Error seeking audio: " + e};
                        }

                        result = {"status" : 1, "message" : "Seek to audio succeeded" };
                    }
                    break;
                case 'pausePlayingAudio':
                    if (!audio) {
                        return {"status" : 2, "message" : "Audio Object has not been initialized"};
                    }

                    audio.pause();

                    result = {"status" : 1, "message" : "Audio paused" };
                    break;
                case 'getCurrentPositionAudio':
                    if (!audio) {
                        return {"status" : 2, "message" : "Audio Object has not been initialized"};
                    }

                    result = {"status" : 1, "message" : audio.currentTime };
                    break;
                case 'getDuration':
                    if (!audio) {
                        return {"status" : 2, "message" : "Audio Object has not been initialized"};
                    }

                    result = {"status" : 1, "message" : audio.duration };
                    break;
                case 'startRecordingAudio':
                    if (args.length <= 1) {
                        result = {"status" : 9, "message" : "Media start recording, insufficient arguments"};
                    }

                    blackberry.media.microphone.record(args[1], win, fail);
                    result = retAsyncCall;
                    break;
                case 'stopRecordingAudio':
                    break;
                case 'release':
                    if (audio) {
                        audioObjects[id] = undefined;
						audio.src = undefined;
                        //delete audio;
                    }

                    result = {"status" : 1, "message" : "Media resources released"};
                    break;
                default:
                    result = retInvalidAction;
                }

                return result;
            }
        },

        networkAPI = {
            execute: function (webWorksResult, action, args, win, fail) {
                var connectionType = Connection.NONE,
                    eventType = "offline",
                    callbackID,
                    request;

                /**
                 * For PlayBooks, we currently only have WiFi connections, so return WiFi if there is
                 * any access at all.
                 * TODO: update if/when PlayBook gets other connection types...
                 */
                switch (action) {
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

                    return { "status": PhoneGap.callbackStatus.OK, "message": {"type": connectionType, "event": eventType } };
                }
                return retInvalidAction;
            }
        },

        notificationAPI = {
            execute: function (webWorksResult, action, args, win, fail) {
				if (args.length !== 3) {
					return {"status" : 9, "message" : "Notification action - " + action + " arguments not found"};

				}
				
				//Unpack and map the args
                var msg = args[0],
                    title = args[1],
					btnLabel = args[2],
					btnLabels;

                switch (action) {
                case 'alert':
                    blackberry.ui.dialog.customAskAsync.apply(this, [ msg, [ btnLabel ], win, { "title" : title } ]);
                    return retAsyncCall;
                case 'confirm':
                    btnLabels = btnLabel.split(",");
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

    phonegap.PlayBookPluginManager = function () {
        PhoneGap.onNativeReady.fire();
    };

    phonegap.PlayBookPluginManager.prototype.exec = function (win, fail, clazz, action, args) {
        var wwResult = webworksPluginManager.exec(win, fail, clazz, action, args);

        //We got a sync result or a not found from WW that we can pass on to get a native mixin
        //For async calls there's nothing to do
        if ((wwResult.status === PhoneGap.callbackStatus.OK || 
		        wwResult.status === PhoneGap.callbackStatus.CLASS_NOT_FOUND_EXCEPTION) &&
			    plugins[clazz]) {
            return plugins[clazz].execute(wwResult.message, action, args, win, fail);
        }

        return wwResult;
    };

    phonegap.PlayBookPluginManager.prototype.resume = function () {};
    phonegap.PlayBookPluginManager.prototype.pause = function () {};
    phonegap.PlayBookPluginManager.prototype.destroy = function () {};

    //Instantiate it
    return new phonegap.PlayBookPluginManager();
}(new phonegap.WebWorksPluginManager()));
