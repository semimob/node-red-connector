"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.reference = config.reference;
        this.html = config.html;
        this.htmlType = config.htmlType;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();
            var html = smeHelper.getNodeConfigValue(node, msg, node.htmlType, node.html);
            if (html) {
                var smeMsg = {
                    Type: 'chat',
                    TypeID: '38199F47-504C-4C73-97E5-8076C8CFAA21',
                    Reference: node.reference,
                    Html: html,
                };

                var smeFormMsg = smeHelper.addSendingMsg(msg, smeMsg);
            }

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-htmlmessage", SmeNode);
};