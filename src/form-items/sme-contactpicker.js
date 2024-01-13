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
                FormTypeID: 'e4044aec-b7fd-406e-a043-e08e166f7434',
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

    RED.nodes.registerType("sme-contactpicker", SmeNode);
};