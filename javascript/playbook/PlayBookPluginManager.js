/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, Research In Motion Limited.
 */


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
			var actionFound = false,
                event = "offline",
                networkStatus,
                connectionType,
                callbackID,
                requestID;

            function handleNetworkChange(networkStatus) {
                var response = {};

                response.type = NetworkStatus.REACHABLE_VIA_WIFI_NETWORK;
                response.event = networkStatus;

                if (response.type === "offline") {
                    response.type = NetworkStatus.NOT_REACHABLE;
                }

                win(resonse);
            };

			/**
			 * For PlayBooks, we currently only have WiFi connections, so return WiFi if there is
			 * any access at all.
			 * TODO: update if/when PlayBook gets other connection types...
			 */
			switch(action) {
				case 'isReachable':
                    networkStatus = NetworkStatus.NOT_REACHABLE;
                    if (blackberry.system.hasDataCoverage()) {
                        networkStatus = NetworkStatus.REACHABLE_VIA_WIFI_NETWORK;
                        event = "online";
                    }
                    
                    return { "status" : 1, "message" : Integer.toString(networkStatus) };
                
                case 'getConnectionInfo':
                	
					//Register an event handler for the networkChange event
					callbackID = blackberry.events.registerEventHandler("networkChange", handleNetworkChange, eventParams);
					
					//pass our callback id down to our network extension
					requestID = new blackberry.transport.RemoteFunctionCall("blackberry/network/networkStatusChanged");
					request.addParam("networkStatusChangedID", callbackID);
					request.makeAsyncCall(); //don't care about the return value
					
                    connectionType = connection.UNKNOWN;
                    if (blackberry.system.hasDataCoverage()) {
                        connectionType = connectionType.WIFI;
                        event = "online";
                    }
                    
                    return { "status" : 1, "message" : Integer.toString(connectionType) };
				
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
