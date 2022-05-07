"use strict";

const Core = require('./sme-core.js');
const smeMessagedeleter = require('./sme-messagedeleter.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.bucketType = config.bucketType;

        this.bucketName = config.bucketName;
        this.bucketNameType = config.bucketNameType;

        this.bucketReference = config.bucketReference;
        this.bucketReferenceType = config.bucketReferenceType;

        this.autoBucket = config.autoBucket == "1";

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();
            var smeSendingBox = smeHelper.getSendingBox(msg);

            if (smeSendingBox) {
                var smeReceivedMsg = smeHelper.getReceivedMsg(msg);

                smeSendingBox.forEach(smeMsg => {
                    switch (node.bucketType) {
                        case 'Reply': {
                            if (smeReceivedMsg)
                                smeMsg.ConversationID = smeReceivedMsg.ConversationID;
                            break;
                        }
                        case 'Sender': {
                            if (smeReceivedMsg)
                                smeMsg.ReceiverID = smeReceivedMsg.SenderID;
                            break;
                        }
                        case 'Submiter': {
                            if (smeReceivedMsg)
                                smeMsg.ReceiverID = smeReceivedMsg.SubmitUserID;
                            break;
                        }
                        case 'UserMoment': {
                            var deliveryOption = smeHelper.getMsgDeliveryOption(smeMsg.DeliveryOption);
                            deliveryOption.PublishToMoment = true;
                            break;
                        }
                        case 'UserProfile': {
                            var deliveryOption = smeHelper.getMsgDeliveryOption(smeMsg.DeliveryOption);
                            deliveryOption.PublishToProfile = true;
                            break;
                        }
                        case 'ReferencedBucket': {
                            var bucketReference = smeHelper.getNodeConfigValue(node, msg, node.bucketReferenceType, node.bucketReference);
                            if (bucketReference) {
                                var toObject = smeHelper.getMsgDeliveryOptionToObject(smeMsg);
                                toObject.Reference = bucketReference;

                                var bucketName = smeHelper.getNodeConfigValue(node, msg, node.bucketNameType, node.bucketName);
                                if (bucketName) {
                                    toObject.Name = bucketName;
                                    if (node.autoBucket)
                                        toObject.AutoCreateObject = true;
                                }
                            }
                            break;
                        }
                        case 'NamedBucket': {
                            var bucketName = smeHelper.getNodeConfigValue(node, msg, node.bucketNameType, node.bucketName);
                            if (bucketName) {
                                var toObject = smeHelper.getMsgDeliveryOptionToObject(smeMsg);
                                toObject.Name = bucketName;
                                if (node.autoBucket)
                                    toObject.AutoCreateObject = true;
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