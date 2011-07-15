/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, Research In Motion Limited.
 */


package com.phonegap.network {
    import flash.net.NetworkInfo;
    import flash.net.NetworkInterface;
    
    import webworks.extension.DefaultExtension;
    
    public class Network extends DefaultExtension{
        
        internal var jsFunctionIDNetwork:Array;
        
        public function SystemEvents(){
            super();
            jsFunctionIDNetwork = new Array();
        }       
        
        public function networkStatusChanged(param:String):void{ 
            jsFunctionIDNetwork[jsFunctionIDNetwork.length] = param;
           NetworkInfo.NetworkInfo.addEventListener(flash.events.Event.NETWORK_CHANGE, networkChange);       
        }
        
        private function networkChange( event:NetworkInfo.networkChange ) : void{
            
            /**
             * Right now, we only care if there is a connection or not, since PlayBook only has WiFi
             * At the JS layer, we will map this from offline/online.
             * At some point in the future where there are more connection types on PlayBook,
             * we will want to attempt to map this to the real PhoneGap connection types...
             */
            
            var haveCoverage : Boolean = false;
            var networkStatus : String = "offline";

			NetworkInfo.networkInfo.findInterfaces().every(
				function callback(item:NetworkInterface, index:int, vector:Vector.<NetworkInterface>):Boolean {
					haveCoverage = item.active || haveCoverage;

					return !haveCoverage;
				}, this);

			if (haveCoverage) {
				networkStatus = "online";
			}
            
            var type:Array = new Array(1);
            type[0] = event.type;
            for (var i:Number=0; i<jsFunctionIDNetwork.length ; i++){
                evalJavaScriptEvent(jsFunctionIDNetwork[i], networkStatus);
            }
        }
    }
}

