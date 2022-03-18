"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.reference = config.reference;
        this.formStatus = config.formStatus;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var m = typeof (msg.payload) == 'object' ? (msg.payload || {}) : {};

            m.Type = 'chat';
            m.TypeID = '457d1d4f-c982-4caf-bcc4-4b435860efa3';

            m.Reference = node.reference;
            m.FormStatus = node.formStatus ? 1 : 0;
            m.FormItems = m.FormItems || [];
            m.Body = m.Body || node.formName;

            msg.payload = m;

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-form", SmeNode);
};