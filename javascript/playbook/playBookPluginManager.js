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
    
    var loggerAPI = {
        execute: function(webWorksResult, action, args, win, fail) {
            if(action === 'log') {
                console.log(args);
                
                return {"status" : PhoneGap.callbackStatus.OK, 
                        "message" : 'Message logged to console: ' + msg};
            }
            
            return retInvalidAction;
        }
    };
    
    var networkAPI = {
		execute: function(action, args, win, fail) {
			var actionFound = false,
                networkStatus = NetworkStatus.NOT_REACHABLE,
                connectionType = connection.NONE,
                callbackID,
                requestID;

			/**
			 * For PlayBooks, we currently only have WiFi connections, so return WiFi if there is
			 * any access at all.
			 * TODO: update if/when PlayBook gets other connection types...
			 */
			switch(action) {
				case 'isReachable':
                    if (blackberry.system.hasDataCoverage()) {
                        networkStatus = NetworkStatus.REACHABLE_VIA_WIFI_NETWORK;
                    }
                    
                    return { "status" : 1, "message" : networkStatus };
                
                case 'getConnectionInfo':
                    if (blackberry.system.hasDataCoverage()) {
                        connectionType = connectionType.WIFI;
                    }
                    
                    return { "status" : 1, "message" : connectionType };
                
                case "registerNetworkChangeEvent":
					//Register an event handler for the networkChange event
					callbackID = blackberry.events.registerEventHandler("networkChange", win, eventParams);

					//pass our callback id down to our network extension
					requestID = new blackberry.transport.RemoteFunctionCall("blackberry/network/networkStatusChanged");
					request.addParam("networkStatusChangedID", callbackID);
					request.makeAsyncCall(); //don't care about the return value

                    return { "status" : 0, "message": "event registered" };

				default:
					fail();
			} 
		}
	};
	
    var plugins = {
        'Device' : deviceAPI,
        'Logger' : loggerAPI,
        'Network Status' : networkAPI
	};
	
	//Instantiate it
	return new PlayBookPluginManager();
})(new PluginManager());
