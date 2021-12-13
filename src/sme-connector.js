const core = require('./sme-core.js');

module.exports = function(RED) {
	"use strict";
	
    function SmeConnectorNode(config) {		
        RED.nodes.createNode(this,config);
		var node = this;
		
		this.smeServer = config.server && RED.nodes.getNode(config.server);
		this.smeToken = config.token;
		
		function sendWsMessage(msg){
			node.log('sendWsMessage: ', msg);
		}
		
		this.smeSend = sendWsMessage;
    };
	
	RED.nodes.registerType("sme-connector", SmeConnectorNode);
};