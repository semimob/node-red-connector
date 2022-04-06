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
            Body: '' + msg,
        };
    }

    function SmeNode(config) {		
        RED.nodes.createNode(this, config);
        var applicationID = this.credentials.applicationID;

        var server = (this.credentials && this.credentials.server) || "cloud.semilimes.net";
        var serverApiURL = `https://${server}/CloudServer/api/`;
        var serverWsURL = `wss://${server}/CloudServer/wsclient?t=` + applicationID;

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
            msg.AuthToken = applicationID;

            if (!(msg.ConversationID || msg.ReceiverID || msg.ReceiverName))
                msg.ConversationID = applicationID;

            webSocket.send(msg);
        }

        function sendApiMessage(msg, async) {
            msg = validateMessage(msg);

            if (!(msg.ConversationID || msg.ReceiverID || msg.ReceiverName))
                msg.ConversationID = applicationID;

            var methodID = async ? '3A01CE9E-F850-4049-AD45-DA372E44B89B' : '4E9DDB53-00A3-4006-AFBC-2C4102EC69C1';
            return apiClient.callApi(methodID, { Token: applicationID, Message: msg });
        }

        function callApi(methodID, data) {
            data.AuthToken = applicationID;
            return apiClient.callApi(methodID, data);
        }

        function addMessageListener(listener) {
            webSocket.addMessageListener(listener);
        }

        function addStatusListener(listener) {
            webSocket.addStatusListener(listener);
        }

        //  Export
        this.postMessage = sendWebSocketMessage;
        this.sendMessage = sendApiMessage;
        this.callApi = callApi;
        this.addMessageListener = addMessageListener;
        this.addStatusListener = addStatusListener;
    };
	
    RED.nodes.registerType("sme-connector", SmeNode, {
        credentials: {
            reservedCode: { type: "text" },
            server: { type: "text" },
            appName: { type: "text" },
            applicationID: { type: "text" }
        },
    });
};