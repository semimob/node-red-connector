"use strict";

module.exports = function (RED) {

    function SmeLabelNode(config) {
        RED.nodes.createNode(this, config);
        this.text = config.text;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var m = typeof (msg.payload) == 'object' ? (msg.payload || {}) : {};

            m.Type = 'chat';
            m.TypeID = '457d1d4f-c982-4caf-bcc4-4b435860efa3';
            m.Body = node.title || node.name || m.Body;
            m.FormReference = node.name || m.FormReference;
            m.FormStatus = node.formStatus ? 1 : 0;
            m.FormItems = m.FormItems || [];

            m.FormItems.push({
                FormTypeID: '590e4e6c-2c5d-47e8-8f38-311d5a299ee7',
                FormTypeConfig: {
                    Text: node.text
                }
            });

            msg.payload = m;

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-label", SmeLabelNode);
};