"use strict";

const Core = require('./../sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.title = config.title;
        this.buttonText = config.buttonText;
        this.currentLocationOnly = config.currentLocationOnly;
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
                FormTypeID: '20a0ce4b-a236-4e96-9629-45a3af5f62ea',
                FormTypeConfig: {
                    Title: node.title,
                    ButtonText: node.buttonText,
                    CurrentLocationOnly: node.currentLocationOnly == '1' ? 1 : 0,
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

    RED.nodes.registerType("sme-locationpicker", SmeNode);
};