"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.bucketName = config.bucketName;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            if (msg.payload != null && typeof (msg.payload) == 'object') {
                if (node.bucketName) {
                    msg.payload.ReceiverName = node.bucketName;
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

    RED.nodes.registerType("sme-setbucket", SmeNode);
};