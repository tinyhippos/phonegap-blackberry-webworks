phonegap.PluginManager = { function (){

	this.PluginManager = function() {
	};
	
	PluginManager.prototype.exec = function(win, fail, clazz, action, args) {
		if(plugins[clazz]){
			return PhoneGap.plugins[clazz].execute(action, args, win, fail);
		}else{
			return {"status" : 2, "message" : "Class " + clazz+ " cannot be found"};
		}
	}

	cameraAPI = {
		execute: function(action, args, win, fail) {
			var actionFound = false;
			switch(action) {
				case 'getPicture':
					blackberry.media.camera.takePicture(win, null, fail);
					return { "status" : 0, "message" : "WebWorks is On It"};
				default:
					fail();
			}      
		}
	}

	deviceAPI = {
		execute: function(action, args, win, fail) {
			var actionFound = false;
			switch(action) {
				case 'getDeviceInfo':				
					win({"version" : blackberry.system.softwareVersion,
						 "name" : blackberry.system.model,
						 "uuid" : blackberry.identity.PIN,
						 "phoneGap" : "1.0.0rc1"});
					return { "status" : 1, "message" : "WebWorks is On It"};
				default:
					fail();
			}   
		}
	}

	PhoneGap.plugins = {};
	PhoneGap.plugins['Camera'] = cameraAPI;
	PhoneGap.plugins['Device'] = deviceAPI;
	
	//Instantiate it
	return new PluginManager();
}();


