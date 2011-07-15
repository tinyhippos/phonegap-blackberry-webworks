
package blackberry.system.event {
    import flash.net.NetworkInfo;
    
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
            
            var type:Array = new Array(1);
            type[0] = event.type;
            for (var i:Number=0; i<jsFunctionIDNetwork.length ; i++){
                evalJavaScriptEvent(jsFunctionIDNetwork[i], type);
            }
    
        }
    }
}
