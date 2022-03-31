"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.messageMode = config.messageMode;
        this.autoBucket = config.autoBucket;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            if (msg.payload != null && typeof (msg.payload) == 'object') {
                msg.payload.DeliveryOption = {
                    Mode: node.messageMode,
                };

                if (node.autoBucket)
                    msg.payload.DeliveryOption.AutoBucket = true;

                send(msg, false);
            }
            else {
                node.status({ fill: 'red', shape: 'ring', text: 'Invalid payload.' })
            }

            done && done();
        });
    };

    RED.nodes.registerType("sme-option", SmeNode);
};