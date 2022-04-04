"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.reference = config.reference;
        this.html = config.html;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var html = node.html || msg.Html;
            if (html) {
                var smeMsg = {
                    Type: 'chat',
                    TypeID: '38199F47-504C-4C73-97E5-8076C8CFAA21',
                    Reference: node.reference,
                    Html: html,
                };

                var core = new Core();
                var smeHelper = new core.SmeHelper();
                var smeFormMsg = smeHelper.addSendingMsg(msg, smeMsg);
            }

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-webviewmessage", SmeNode);
};