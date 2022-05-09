"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.text = config.text;
        this.textType = config.textType;
        this.reference = config.reference;

        var node = this;

        node.on('input', function (msg, send, done) {
            if (node.reference || node.text) {
                send = send || function () { node.send.apply(node, arguments) };

                var core = new Core();
                var smeHelper = new core.SmeHelper();

                var textValue = smeHelper.getNodeConfigValue(node, msg, node.textType, node.text);
                if (textValue) {
                    var smeMsg = {
                        Type: 'chat',
                        TypeID: '590e4e6c-2c5d-47e8-8f38-311d5a299ee7',
                        Reference: node.reference,
                        Body: '' + textValue,
                    };

                    smeHelper.addSendingMsg(msg, smeMsg);
                }
            }

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-textmessage", SmeNode);
};