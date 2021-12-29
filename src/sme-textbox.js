"use strict";

module.exports = function (RED) {

    function SmeTextBoxNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.title = config.title;
        this.value = config.value;
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
                        FormTypeID: 'b7ecf187-e387-4b7b-9809-6eb7c7c964e2',
                        FormTypeConfig: {
                            Title: node.title
                        },
                        FormValue: node.value,
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

    RED.nodes.registerType("sme-textbox", SmeTextBoxNode);
};