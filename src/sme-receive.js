"use strict";

module.exports = function (RED) {

    function SmeReceiveNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var smeConnector = config.connector && RED.nodes.getNode(config.connector);

        //	Listener for message...
        if (smeConnector) {
            smeConnector.addMessageListener(msg => {
                node.send({ payload: msg }, false);
            });
        }
        else {
            node.log('receiver not connect.');
        }
    };

    RED.nodes.registerType("sme-receive", SmeReceiveNode);
};