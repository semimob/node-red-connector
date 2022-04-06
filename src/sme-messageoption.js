"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.messageMode = config.messageMode;
        this.autoBucket = config.autoBucket == "1";

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();
            var smeSendingBox = smeHelper.getSendingBox();

            if (smeSendingBox) {
                smeSendingBox.forEach(smeMsg => {
                    var deliveryOption = smeMsg.DeliveryOption;
                    if (deliveryOption == null)
                        deliveryOption = smeMsg.DeliveryOption = {};

                    deliveryOption.Mode = node.messageMode;
                });
            }

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-messageoption", SmeNode);
};