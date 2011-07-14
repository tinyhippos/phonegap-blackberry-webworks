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
	
	networkAPI = {
		execute: function(action, args, win, fail) {
			var actionFound = false;
			/**
			 * For PlayBooks, we currently only have WiFi connections, so return WiFi if there is
			 * any access at all.
			 * TODO: update if/when PlayBook gets other connection types...
			 */
			switch(action) {
				case 'isReachable':
					var networkStatus = NetworkStatus.NOT_REACHABLE;
					if (blackberry.system.hasDataCoverage()) {
						networkStatus = NetworkStatus.REACHABLE_VIA_WIFI_NETWORK;
					}
                    return { "status" : 1, "message" : Integer.toString(networkStatus) };
                    
                case 'getConnectionInfo':
                	var connection = Connection.NONE;
                	var event = "offline";
                	if (blackberry.system.hasDataCoverage()) {
						connection = Connection.WIFI;
						event = "online";
					}
                    return { "status" : 1, "message" : {"type":connection, "event":event } };
                
				
				default:
					fail();						
			}   
		}
	};
	
    var plugins = {
		'Camera' : cameraAPI,
		'Device' : deviceAPI,
		'Network Status' : networkAPI
	};
	
	//Instantiate it
	return new PlayBookPluginManager();
})(phonegap.PluginManager);