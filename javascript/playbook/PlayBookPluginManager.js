if(!window.phonegap) window.phonegap = {};

phonegap.PluginManager = (function(webworksPluginManager) {
	
	this.PlayBookPluginManager = function() {
		PhoneGap.onNativeReady.fire();
        //H@x Attack!! this should be done in Network
        PhoneGap.onPhoneGapConnectionReady.fire();
	};
	
	PlayBookPluginManager.prototype.exec = function(win, fail, clazz, action, args) {
		if(plugins[clazz]){
            return plugins[clazz].execute(action, args, win, fail);
		}else{
			return webworksPluginManager.exec(win, fail, clazz, action, args);
		}
	};
    
    PlayBookPluginManager.prototype.resume = function(){};
    PlayBookPluginManager.prototype.pause = function(){};
    PlayBookPluginManager.prototype.destroy = function(){};
	
	PlayBookPluginManager.prototype.callback = function(success, win, fail) {
		if (!success) 
			fail();    
    };

	var deviceAPI = {
		execute: function(action, args, win, fail) {
			var actionFound = false;
			switch(action) {
				case 'getDeviceInfo':
                    var webWorksResult = webworksPluginManager.exec(win, fail, 'Device', action, args).message;
					webWorksResult.platform = "PlayBook";
					return {"status" : 1, 
							"message" : webWorksResult};
				default:
					fail();						
			}  
		}
	};
	
    var plugins = {
		'Device' : deviceAPI
	};
	
	//Instantiate it
	return new PlayBookPluginManager();
})(new PluginManager());