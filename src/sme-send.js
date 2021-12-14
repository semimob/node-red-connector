"use strict";

module.exports = function (RED) {

    function SmeSendNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var smeConnector = config.connector && RED.nodes.getNode(config.connector);

        node.on('input', function (msg, send, done) {
            if (smeConnector != null)
                smeConnector.sendMessage(msg);

            if (done)
                done();
        });
    };

    RED.nodes.registerType("sme-send", SmeSendNode);
};