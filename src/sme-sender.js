"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);
        this.async = config.async;
        var node = this;

        var smeConnector = config.connector && RED.nodes.getNode(config.connector);
        if (!smeConnector)
            return;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();
            var smeSendingBox = smeHelper.getSendingBox();
            if (smeSendingBox.length > 0) {
                smeSendingBox.foreach((smeMsg, index) => {
                    var promise = smeConnector.sendMessage(smeMsg);

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
            else {
                send(msg, false);
                done && done();
            }
        });
    };

    RED.nodes.registerType("sme-sender", SmeNode);
};