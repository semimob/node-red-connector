"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {	
    function validateMessage(msg) {
        if (!msg)
            throw new Error('Invalid message!');

        var type = typeof (msg);
        if (type === 'object')
            return msg;

        if (type === 'string' && msg.startsWidth('{')) {
            try {
                return JSON.parse(msg);
            }
            catch{ }
        }

        return {
            Type: 'chat',
            Body: msg,
        };
    }

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
		
        function sendWebSocketMessage(msg) {
            msg = validateMessage(msg);
            msg.AuthToken = msg.AuthToken || token;
            webSocket.send(msg);
        }

        function sendApiMessage(msg) {
            msg = validateMessage(msg);
            return apiClient.callApi('4E9DDB53-00A3-4006-AFBC-2C4102EC69C1', { Token: msg.AuthToken || token, Message: msg });
        }

        function callApi(methodID, data) {
            data.AuthToken = token;
            return apiClient.callApi(methodID, data);
        }

        function addMessageListener(listener) {
            webSocket.on('message', listener);
        }

        //  Export
        this.postMessage = sendWebSocketMessage;
        this.sendMessage = sendApiMessage;
        this.callApi = callApi;
        this.addMessageListener = addMessageListener;
    };
	
	RED.nodes.registerType("sme-connector", SmeConnectorNode);
};