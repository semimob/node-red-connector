"use strict";

module.exports = function (RED) {

    function SmeTextBoxNode(config) {
        RED.nodes.createNode(this, config);
        this.label = config.label;
        this.name = config.name;
        this.value = config.value;
        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var textboxLabel = node.label;
            var formReference = node.name;
            var textboxValue = node.value;

            var m = {
                Type: 'chat',
                TypeID: '457d1d4f-c982-4caf-bcc4-4b435860efa3',
                Body: textboxLabel,
                FormItems: [
                    {
                        FormTypeID: 'b7ecf187-e387-4b7b-9809-6eb7c7c964e2',
                        FormTypeConfig: {
                            Title: textboxLabel
                        },
                        FormValue: textboxValue,
                        FormRequired: true,
                        FormReference: 'value',
                        AutoSubmit: true
                    }
                ],
                FormReference: formReference
            };

            msg.payload = m;

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-textbox", SmeTextBoxNode);
};