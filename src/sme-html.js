"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.reference = config.reference;
        this.html = config.html;
        this.text = config.text;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var m = node.html || msg.payload || '';

            send({
                Type: 'chat',
                TypeID: '38199F47-504C-4C73-97E5-8076C8CFAA21',
                Reference: node.reference,
                Html: m,
                Body: node.text
            });

            done && done();
        });
    };

    RED.nodes.registerType("sme-html", SmeNode);
};