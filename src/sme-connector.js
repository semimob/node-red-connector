module.exports = function(RED) {
	"use strict";
	
	const util = require('./sme-util.js');
	
    function SmeConnectorNode(config) {		
        RED.nodes.createNode(this,config);
		var node = this;
		
		this.smeServer = config.server && RED.nodes.getNode(config.server);
		this.smeToken = config.token;
		
		function sendWsMessage(msg){
			this.log('sendWsMessage: ', msg);
		}
		
		this.smeSend = sendWsMessage;
    };
	
	RED.nodes.registerType("sme-connector", SmeConnectorNode);
};