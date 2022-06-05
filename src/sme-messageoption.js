"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.messageMode = config.messageMode;
        this.pin = config.pin;

        var node = this;
        
        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            if (node.messageMode) {
                var core = new Core();
                var smeHelper = new core.SmeHelper();

                var messagePin = smeHelper.isTrue(node.pin) ? 1 : null;

                var smeSendingBox = smeHelper.getSendingBox(msg);
                if (smeSendingBox) {
                    smeSendingBox.forEach(smeMsg => {
                        var deliveryOption = smeMsg.DeliveryOption;
                        if (deliveryOption == null)
                            deliveryOption = smeMsg.DeliveryOption = {};

                        deliveryOption.Mode = node.messageMode;

                        if (messagePin != null || deliveryOption.Pin != null)
                            deliveryOption.Pin = messagePin;
                    });
                }
            }

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-messageoption", SmeNode);
};