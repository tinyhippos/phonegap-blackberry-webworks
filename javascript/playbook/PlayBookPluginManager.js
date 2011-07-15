if(!window.phonegap) window.phonegap = {};

phonegap.PluginManager = (function(webworksPluginManager) {
	
	this.PlayBookPluginManager = function() {
		PhoneGap.onNativeReady.fire();
        //H@x Attack!! this should be done in Network
        PhoneGap.onPhoneGapConnectionReady.fire();
	};
	
	PlayBookPluginManager.prototype.exec = function(win, fail, clazz, action, args) {
		var wwResult = webworksPluginManager.exec(win, fail, clazz, action, args);
        
        //We got a sync result from WW that we can pass on to get a native mixin
        //For async calls there's nothing to do
        if(wwResult.status == PhoneGap.callbackStatus.OK && plugins[clazz]){
            return plugins[clazz].execute(wwResult.message, action, args, win, fail);
		}
        
        return wwResult;
	};
    
    PlayBookPluginManager.prototype.resume = webworksPluginManager.resume;
    PlayBookPluginManager.prototype.pause = webworksPluginManager.pause;
    PlayBookPluginManager.prototype.destroy = webworksPluginManager.destroy;
	
	var retInvalidAction = { "status" : 7, "message" : "Action not found" };

	var deviceAPI = {
		execute: function(webworksResult, action, args, win, fail) {
			if(action === 'getDeviceInfo') {
                    //Augment WW result and return it
					webWorksResult.platform = "PlayBook";
					return {"status" : 1, 
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