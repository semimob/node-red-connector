"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.reference = config.reference;
        this.html = config.html;
        this.text = config.text;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var m = typeof (msg.payload) == 'object' ? (msg.payload || {}) : {};
            var html = node.html || m.Html;

            if (html) {
                m.Type = 'chat';
                m.TypeID = '38199F47-504C-4C73-97E5-8076C8CFAA21';
                m.Reference = node.reference;
                m.Html = html;

                msg.payload = m;

                send(msg, false);
            }
            
            done && done();
        });
    };

    RED.nodes.registerType("sme-html", SmeNode);
};