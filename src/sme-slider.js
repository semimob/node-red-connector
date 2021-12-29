"use strict";

module.exports = function (RED) {

    function SmeSliderNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.title = config.title;
        this.min = config.min;
        this.max = config.max;
        this.step = config.step;
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
                        FormTypeID: 'ac6fcee7-b165-42c1-b1e0-fdc4aba22195',
                        FormTypeConfig: {
                            Title: node.title,
                            Min: this.min || 0,
                            Max: this.max || 100,
                            DivisionStep: this.step || 5
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

    RED.nodes.registerType("sme-slider", SmeSliderNode);
};