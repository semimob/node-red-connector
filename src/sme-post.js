"use strict";

module.exports = function (RED) {

    function SmePostNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var smeConnector = config.connector && RED.nodes.getNode(config.connector);

        node.on('input', function (msg, send, done) {
            if (smeConnector != null)
                smeConnector.postMessage(msg);

            done && done();
        });
    };

    RED.nodes.registerType("sme-post", SmePostNode);
};