"use strict";

module.exports = function (RED) {

    function SmeHtmlNode(config) {
        RED.nodes.createNode(this, config);
        this.html = config.html;
        this.text = config.text;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var m = node.html || msg.payload || '';

            send({
                Type: 'chat',
                TypeID: '38199F47-504C-4C73-97E5-8076C8CFAA21',
                Html: m,
                Body: node.text
            });

            done && done();
        });
    };

    RED.nodes.registerType("sme-html", SmeHtmlNode);
};