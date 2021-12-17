"use strict";

module.exports = function (RED) {

    function SmeSendNode(config) {
        RED.nodes.createNode(this, config);
        this.async = config.async;
        var node = this;

        var smeConnector = config.connector && RED.nodes.getNode(config.connector);

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            if (smeConnector != null) {
                var promise = smeConnector.sendMessage(msg.payload, node.async);
                promise.then(
                    value => {
                        send(msg, false);
                        done && done(value);
                    },
                    reason => {
                        msg.error = reason;
                        send(msg, false);
                        done && done(reason);
                    }
                );
            }
            else {
                send(msg, false);
                done && done();
            }
        });
    };

    RED.nodes.registerType("sme-send", SmeSendNode);
};