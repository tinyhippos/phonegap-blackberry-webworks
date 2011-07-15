/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, Research In Motion Limited.
 */

//BlackBerry attaches the Java plugin manager at phonegap.PluginManager, we go to the same
//spot for compatibility
if(!window.phonegap) window.phonegap = {};

phonegap.PluginManager = (function(webworksPluginManager) {
	
	this.PlayBookPluginManager = function() {
		PhoneGap.onNativeReady.fire();
        //H@x Attack!! this should be done in Network
        PhoneGap.onPhoneGapConnectionReady.fire();
	};
	
	PlayBookPluginManager.prototype.exec = function(win, fail, clazz, action, args) {
		var wwResult = webworksPluginManager.exec(win, fail, clazz, action, args);
        
        //We got a sync result or a not found from WW that we can pass on to get a native mixin
        //For async calls there's nothing to do
        if(wwResult.status == PhoneGap.callbackStatus.OK || wwResult.status == PhoneGap.callbackStatus.CLASS_NOT_FOUND_EXCEPTION && plugins[clazz]){
            return plugins[clazz].execute(wwResult.message, action, args, win, fail);
		}
        
        return wwResult;
	};
    
    PlayBookPluginManager.prototype.resume = webworksPluginManager.resume;
    PlayBookPluginManager.prototype.pause = webworksPluginManager.pause;
    PlayBookPluginManager.prototype.destroy = webworksPluginManager.destroy;
	
	var retInvalidAction = { "status" : PhoneGap.callbackStatus.INVALID_ACTION, "message" : "Action not found" };

	var deviceAPI = {
		execute: function(webWorksResult, action, args, win, fail) {
			if(action === 'getDeviceInfo') {
                    //Augment WW result and return it
					webWorksResult.platform = "PlayBook";
					return {"status" : PhoneGap.callbackStatus.OK, 
							"message" : webWorksResult};
			}  
            
            return retInvalidAction;					
		}
	};
	
    var plugins = {
		'Device' : deviceAPI
	};
	
	//Instantiate it
	return new PlayBookPluginManager();
})(new PluginManager());