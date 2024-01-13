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

            smeFormMsg.Type = smeFormMsg.Type || 'chat';
            smeFormMsg.TypeID = smeFormMsg.TypeID || '457d1d4f-c982-4caf-bcc4-4b435860efa3';
            smeFormMsg.FormItems = smeFormMsg.FormItems || [];

            smeFormMsg.FormItems.push({
                FormTypeID: '382A91A0-F3BE-4191-862C-2424E257B022',
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

    RED.nodes.registerType("sme-qrscanner", SmeNode);
};