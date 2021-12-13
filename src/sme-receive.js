"use strict";

module.exports = function(RED) {
	
    function SmeReceiveNode(config) {		
        RED.nodes.createNode(this,config);
		var node = this;
		
		var smeConnector = config.connector && RED.nodes.getNode(config.connector);
		
		//	Listener for message...
    };
	
	RED.nodes.registerType("sme-receive", SmeReceiveNode);
};