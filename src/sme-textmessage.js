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

                var textValue = null;
                switch (node.textType) {
                    case 'str':
                        textValue = node.text;
                        break;
                    case 'msg':
                        if (msg != null) {
                            if (node.text != null) {
                                textValue = typeof (msg) === 'object' ? msg[node.text] : null;
                            }
                            else if (typeof (msg) === 'string') {
                                textValue = msg;
                            }
                            else if (typeof (msg) === 'object' && typeof (msg.payload) === 'string') {
                                textValue = msg.payload;
                            }
                        }
                        break;
                    case 'flow':
                        textValue = node.context().flow.get(node.text);
                        break;
                    case 'global':
                        textValue = node.context().global.get(node.text);
                        break;
                }

                var smeMsg = {
                    Type: 'chat',
                    TypeID: '590e4e6c-2c5d-47e8-8f38-311d5a299ee7',
                    Reference: node.reference,
                    Body: textValue || '',
                };

                var core = new Core();
                var smeHelper = new core.SmeHelper();
                var smeFormMsg = smeHelper.addSendingMsg(msg, smeMsg);
            }

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-textmessage", SmeNode);
};