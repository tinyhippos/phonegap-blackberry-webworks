phonegap.PluginManager = (function(webworksPluginManager) {
	
	this.PlayBookPluginManager = function() {
	};
	
	PlayBookPluginManager.prototype.exec = function(win, fail, clazz, action, args) {
		if(plugins[clazz]){
			return PhoneGap.plugins[clazz].execute(action, args, win, fail);
		}else{
			return {"status" : 2, "message" : "Class " + clazz+ " cannot be found"};
		}
	}
	
	PlayBookPluginManager.prototype.callback = function(success, win, fail) {
		if (!success) 
			fail();    
	}
		
	deviceAPI = {
		execute: function(action, args, win, fail) {
			var actionFound = false;
			switch(action) {
				case 'getDeviceInfo':
					return webworksPluginManager.exec(
						function(device) {
							//Call the real win with our added PB-specific items
							device.platform = 'PlayBook';
							win(device);
						}, 
						fail, 
						'deviceAPI', 
						action, 
						args);
				default:
					fail();						
			}   
		}
	};
	
	PhoneGap.plugins = {};
	PhoneGap.plugins['Camera'] = cameraAPI;
	PhoneGap.plugins['Device'] = deviceAPI;
	
	//Instantiate it
	return new PlayBookPluginManager();
})(phonegap.PluginManager);