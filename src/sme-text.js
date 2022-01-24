"use strict";

module.exports = function (RED) {

    function SmeTextNode(config) {
        RED.nodes.createNode(this, config);

        this.text = config.text;
        this.reference = config.reference;

        var node = this;

        node.on('input', function (msg, send, done) {
            if (this.text != null && this.text.length > 0) {
                send = send || function () { node.send.apply(node, arguments) };

                var m = typeof (msg.payload) == 'object' ? (msg.payload || {}) : {};

                m.Type = 'chat';
                m.TypeID = '590e4e6c-2c5d-47e8-8f38-311d5a299ee7';
                m.Reference = node.reference;
                m.Body = node.text;

                msg.payload = m;

                send(msg, false);
            }

            done && done();
        });
    };

    RED.nodes.registerType("sme-text", SmeTextNode);
};