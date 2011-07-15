if(!window.phonegap) window.phonegap = {};

phonegap.PluginManager = (function(webworksPluginManager) {
	
	this.PlayBookPluginManager = function() {
		PhoneGap.onNativeReady.fire();
	};
	
	PlayBookPluginManager.prototype.exec = function(win, fail, clazz, action, args) {
		if(plugins[clazz]){
            return plugins[clazz].execute(action, args, win, fail);
		}else{
			return {"status" : 2, "message" : "Class " + clazz+ " cannot be found"};
		}
	};
	
	PlayBookPluginManager.prototype.callback = function(success, win, fail) {
		if (!success) 
			fail();    
    };

	deviceAPI = {
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
	
	mediaAPI = {
		
	};
	
    var plugins = {
		'Camera' : cameraAPI,
		'Device' : deviceAPI,
		'Media' : mediaAPI
	};
	
	//Instantiate it
	return new PlayBookPluginManager();
})(phonegap.PluginManager);