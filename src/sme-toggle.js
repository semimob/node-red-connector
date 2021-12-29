"use strict";

module.exports = function (RED) {

    function SmeToggleNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.title = config.title;
        this.formStatus = config.formStatus;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var m = {
                Type: 'chat',
                TypeID: '457d1d4f-c982-4caf-bcc4-4b435860efa3',
                Body: node.title || node.name,
                FormItems: [
                    {
                        FormTypeID: 'c23b3dc6-fa62-45fb-850b-3b2196fb0337',
                        FormTypeConfig: {
                            Title: node.title,
                        },
                        FormRequired: true,
                        FormReference: 'value'
                    }
                ],
                FormReference: node.name,
                FormStatus: node.formStatus ? 1 : 0
            };

            msg.payload = m;

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-toggle", SmeToggleNode);
};