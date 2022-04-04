"use strict";

const Core = require('./../sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);
        this.text = config.text;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();
            var smeFormMsg = smeHelper.getOrAddSendingFormMsg(msg);
            
            smeFormMsg.FormItems.push({
                FormTypeID: '590e4e6c-2c5d-47e8-8f38-311d5a299ee7',
                FormTypeConfig: {
                    Text: node.text
                }
            });
            
            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-label", SmeNode);
};