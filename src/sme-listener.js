"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var smeConnector = config.connector && RED.nodes.getNode(config.connector);
        if (!smeConnector)
            return;

        //	Listener for message...
        smeConnector.addMessageListener(smeMsg => {
            var clonedMsg = JSON.parse(JSON.stringify(smeMsg));
            var nodeRedMsg = { payload: smeMsg };

            var core = new Core();
            var smeHelper = new core.SmeHelper();
            smeHelper.setReceivedMsg(nodeRedMsg, clonedMsg);

            node.send(nodeRedMsg, false);
        });
    };

    RED.nodes.registerType("sme-listener", SmeNode);
};