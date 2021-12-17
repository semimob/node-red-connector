"use strict";

module.exports = function (RED) {

    function SmeTextNode(config) {
        RED.nodes.createNode(this, config);
        this.text = config.text;
        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var m = node.text || (msg && msg.payload) || '';
            if (typeof (m) === 'object')
                m = JSON.stringify(m);

            send({
                Type: 'chat',
                Body: m
            });

            done && done();
        });
    };

    RED.nodes.registerType("sme-text", SmeTextNode);
};