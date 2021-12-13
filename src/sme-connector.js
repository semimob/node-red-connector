"use strict";

module.exports = function(RED) {	
	const core = require('./sme-core.js');
	
    function SmeConnectorNode(config) {		
        RED.nodes.createNode(this,config);
		var node = this;
		
		this.smeServer = config.server && RED.nodes.getNode(config.server);
		this.smeToken = config.token;
		
		function sendWsMessage(msg){
			node.log('sendWsMessage: ', msg);
			return Promise.resolve(msg);
		}
		
		this.smeSend = sendWsMessage;
    };
	
	RED.nodes.registerType("sme-connector", SmeConnectorNode);
};