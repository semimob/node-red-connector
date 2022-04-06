"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.reference = config.reference;
        this.url = config.url;
        this.viewSize = config.viewSize || '1:2';

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            if (node.url) {
                var smeMsg = {
                    Type: 'chat',
                    TypeID: 'D4FC2714-DE91-4067-8A33-2CE1FD42A71F',
                    Reference: node.reference,
                    Body: node.url,
                    WebView: {
                        Url: node.url,
                        ViewTypeID: '71de2cb1-d996-4497-807b-b389db5cf217',
                        LiveWebOption: node.viewSize,
                    }
                };

                var core = new Core();
                var smeHelper = new core.SmeHelper();
                smeHelper.addSendingMsg(msg, smeMsg);
            }

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-webviewmessage", SmeNode);
};