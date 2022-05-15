"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);
        this.async = config.async != "0";
        var node = this;

        var smeConnector = config.connector && RED.nodes.getNode(config.connector);
        if (!smeConnector)
            return;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();
            var smeSendingBox = smeHelper.getSendingBox(msg);
            if (smeSendingBox && smeSendingBox.length > 0) {
                if (node.async) {
                    //  Send message asynchronously
                    node.log('Sending async count: ', smeSendingBox.length);

                    smeSendingBox.forEach(smeMsg => {
                        smeConnector.postMessage(smeMsg);
                    });
                    smeHelper.clearSendingBox(msg);
                    send(msg, false);
                    done && done();
                }
                else {
                    //  Send message synchronously
                    node.log('Sending sync count: ', smeSendingBox.length);

                    //  Send message synchronously
                    smeSendingBox.forEach((smeMsg, index) => {
                        var promise = smeConnector.sendMessage(smeMsg, false);

                        //  Wait for last message sent.
                        if (index == smeSendingBox.length - 1) {
                            promise.then(
                                value => {
                                    smeHelper.clearSendingBox(msg);
                                    send(msg, false);
                                    done && done(value);
                                },
                                reason => {
                                    smeHelper.clearSendingBox(msg);
                                    msg.error = reason;
                                    send(msg, false);
                                    done && done(reason);
                                }
                            );
                        }
                    });
                }
            }
            else {
                node.debug('Sending box is empty!');
                done && done();
            }            
        });
    };

    RED.nodes.registerType("sme-sender", SmeNode);
};