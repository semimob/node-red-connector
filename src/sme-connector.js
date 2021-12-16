"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {	
    
    function SmeConnectorNode(config) {		
        RED.nodes.createNode(this, config);

        var serverConfigNode = (config.server && RED.nodes.getNode(config.server)) || { host: 'cloud.semilimes.net' };
        var serverApiURL = `https://${(serverConfigNode && serverConfigNode.host) || "cloud.semilimes.net"}${serverConfigNode.port ? (":" + serverConfigNode.port) : ""}/CloudServer/api/`;
        var serverWsURL = `wss://${(serverConfigNode && serverConfigNode.host) || "cloud.semilimes.net"}${serverConfigNode.port ? (":" + serverConfigNode.port) : ""}/CloudServer/wsclient`;

        var token = config.token;
        var core = new Core();

        var apiClient = new core.SmeApiClient(serverApiURL);
        var webSocket = new core.SmeWebSocket(serverWsURL);

        var node = this;
		
		function sendWebSocketMessage(msg){
            webSocket.send(msg);
        }

        function callApi(methodID, data) {
            return apiClient.callApi(methodID, data);
        }

        function addMessageListener(listener) {
            webSocket.on('message', listener);
        }

        //  Export
        this.sendMessage = sendWebSocketMessage;
        this.callApi = callApi;
        this.addMessageListener = addMessageListener;
    };
	
	RED.nodes.registerType("sme-connector", SmeConnectorNode);
};