"use strict";

module.exports = function (RED) {

    function SmeSendNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var smeConnector = config.connector && RED.nodes.getNode(config.connector);

        node.on('input', function (msg, send, done) {
            if (smeConnector != null) {
                send = send || function () { node.send.apply(node, arguments) };

                var promise = smeConnector.sendMessage(msg.payload);
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
                done && done();
            }
        });
    };

    RED.nodes.registerType("sme-send", SmeSendNode);
};