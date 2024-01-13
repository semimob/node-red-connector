"use strict";

const Core = require('./../sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.title = config.title;
        this.buttonText = config.buttonText;
        this.required = config.required;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();
            var smeFormMsg = smeHelper.getOrAddSendingFormMsg(msg);

            smeFormMsg.FormItems.push({
                FormTypeID: 'f489c072-2c8b-4bc6-ad75-946d3ca721b7',
                FormTypeConfig: {
                    Title: node.title,
                    ButtonText: node.buttonText,
                    Value: node.value,
                },
                FormValue: node.value,
                FormRequired: smeFormMsg.FormItems.length == 0 || (node.required == 1),
                Reference: node.name,
                AutoSubmit: smeFormMsg.DisabledSubmitButton == true,
            });

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-timepicker", SmeNode);
};