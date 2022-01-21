"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.receiverName = config.receiverName;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            if (msg.payload != null && typeof (msg.payload) == 'object') {
                msg.payload.ReceiverName = node.receiverName;
            }
            
            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-receiver", SmeNode);
};