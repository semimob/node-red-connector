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

        node.on('close', function (removed, done) {
            webSocket.close();
            done();
        });
		
        function sendWebSocketMessage(msg) {
            msg = validateMessage(msg);
            msg.AuthToken = msg.AuthToken || token;
            webSocket.send(msg);
        }

        function sendApiMessage(msg, async) {
            msg = validateMessage(msg);
            var methodID = async ? '3A01CE9E-F850-4049-AD45-DA372E44B89B' : '4E9DDB53-00A3-4006-AFBC-2C4102EC69C1';
            return apiClient.callApi(methodID, { Token: msg.AuthToken || token, Message: msg });
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