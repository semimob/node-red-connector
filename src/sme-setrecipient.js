"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.objectName = config.objectName;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            if (msg.payload != null && typeof (msg.payload) == 'object') {
                if (node.objectName) {
                    msg.payload.ReceiverName = node.objectName;
                    msg.payload.ReceiverID = null;
                    msg.payload.ConversationID = null;

                    send(msg, false);
                }
                else {
                    node.status({fill: 'red', shape: 'ring', text: 'Invalid payload.'})
                }
            }

            done && done();
        });
    };

    RED.nodes.registerType("sme-setrecipient", SmeNode);
};