"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.bucketType = config.bucketType;
        this.bucketName = config.bucketName;
        this.autoBucket = config.autoBucket == "1";

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();
            var smeSendingBox = smeHelper.getSendingBox();

            if (smeSendingBox) {
                var smeReceivedMsg = smeHelper.getReceivedMsg(msg);

                smeSendingBox.foreach(smeMsg => {
                    switch (node.bucketType) {
                        case 'Reply': {
                            smeMsg.ReceiverName = null;
                            smeMsg.ReceiverID = null;
                            smeMsg.ConversationID = null;
                            if (smeReceivedMsg)
                                smeMsg.ConversationID = smeReceivedMsg.ConversationID;
                            break;
                        }
                        case 'Sender': {
                            smeMsg.ReceiverName = node.bucketName;
                            smeMsg.ReceiverID = null;
                            smeMsg.ConversationID = null;
                            if (smeReceivedMsg)
                                smeMsg.ReceiverID = smeReceivedMsg.SenderID;
                            break;
                        }
                        case 'Submiter': {
                            smeMsg.ReceiverName = node.bucketName;
                            smeMsg.ReceiverID = null;
                            smeMsg.ConversationID = null;
                            if (smeReceivedMsg)
                                smeMsg.ReceiverID = smeReceivedMsg.SubmitUserID;
                            break;
                        }
                        case 'NamedBucket': {
                            smeMsg.ReceiverName = node.bucketName;
                            smeMsg.ReceiverID = null;
                            smeMsg.ConversationID = null;
                            if (node.bucketName) {
                                smeMsg.ReceiverName = node.bucketName;

                                if (node.autoBucket) {
                                    var deliveryOption = smeMsg.DeliveryOption || {};;
                                    deliveryOption.AutoBucket = true;
                                    smeMsg.DeliveryOption = deliveryOption;
                                }
                            }
                            break;
                        }
                    }
                });
            }

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-bucketselector", SmeNode);
};