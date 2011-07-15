(function (){

	this.PluginManager = function() {
	};
	
	PluginManager.prototype.exec = function(win, fail, clazz, action, args) {
		if(plugins[clazz]){
			return plugins[clazz].execute(action, args, win, fail);
		}
        
        return {"status" : 2, "message" : "Class " + clazz+ " cannot be found"};
	};
    
    PluginManager.prototype.resume = function(){};
    PluginManager.prototype.pause = function(){};
    PluginManager.prototype.destroy = function(){};
    
    var retAsyncCall = { "status" : 0, "message" : "WebWorks Is On It" };
    var retInvalidAction = { "status" : 7, "message" : "Action not found" };
    
    var cameraAPI = {
		execute: function(action, args, win, fail) {
			switch(action) {
				case 'takePicture':
					blackberry.media.camera.takePicture(win, fail, fail);
					break;
				default:
					return retInvalidAction;
			}

            return retAsyncCall;            
		}
    };

    var deviceAPI = {
		execute: function(action, args, win, fail) {
			switch(action) {
                case 'getDeviceInfo':						
					return { "status" : 1, "message" : {"version" : blackberry.system.softwareVersion,
														"name" : blackberry.system.model,
														"uuid" : blackberry.identity.PIN,
														"phonegap" : "1.0.0rc1"}};
			} 
            
            return retInvalidAction;
		}
    };
    
    var notificationAPI = {
        execute: function(action, args, win, fail) {
			switch(action) {
                case 'alert':						
                    blackberry.ui.dialog.customAskAsync.apply(window,args);
                    break;
                case 'confirm':						
                    blackberry.ui.dialog.customAskAsync.apply(window,args);
                    break;
				default:
					return retInvalidAction;
			}  
            
            return retAsyncCall;
		}
    };

	var plugins = {
		'Camera' : cameraAPI,
		'Device' : deviceAPI,
        'Notification' : notificationAPI
	};
}());


