"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var smeConnector = config.connector && RED.nodes.getNode(config.connector);
        if (!smeConnector)
            return;

        //	Listener for message...
        smeConnector.addMessageListener(msg => {
            node.send({ payload: msg }, false);
        });
    };

    RED.nodes.registerType("sme-listener", SmeNode);
};