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

        plugins = {
            'Camera' : cameraAPI
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
