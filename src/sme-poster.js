"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var smeConnector = config.connector && RED.nodes.getNode(config.connector);
        if (!smeConnector)
            return;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();
            var smeSendingBox = smeHelper.getSendingBox();
            if (smeSendingBox) {
                smeSendingBox.foreach(smeMsg => {
                    console.log('Sending: ', smeMsg);
                    smeConnector.postMessage(smeMsg);
                });

                smeHelper.clearSendingBox(msg);
            }

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-poster", SmeNode);
};