"use strict";

module.exports = function (RED) {

    function SmePostNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var smeConnector = config.connector && RED.nodes.getNode(config.connector);
        if (!smeConnector)
            return;

        node.on('input', function (msg, send, done) {
            if (msg.payload)
                smeConnector.postMessage(msg.payload);

            done && done();
        });
    };

    RED.nodes.registerType("sme-post", SmePostNode);
};